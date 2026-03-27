import logger from '@logger';
import { Server as Engine } from '@socket.io/bun-engine';
import { verify } from 'hono/jwt';
import { JwtTokenExpired } from 'hono/utils/jwt/types';
import { Server } from 'socket.io';

import { APP_CONFIG } from './config/appConfig';
import { configProvider } from './config/configProvider';
import { client } from './infrastucture/cache/client';
import { RepositoryFactory } from './infrastucture/factories/RepositoryFactory';
import { ValidateSession } from './modules/auth/application/use-cases/validateSession';
import {
  ConnectionTokenData,
  TokenService
} from './modules/connection/application/TokenService';
import { encryptedPayloadSchema } from './shared/api/schemas/encryptedPayload.schema';
import { ValidationError } from './shared/errors/Specialized/ValidationError';
import { jwtPaylaod } from './shared/types/jwtPayload';
import { decryptPayload } from './shared/utils/decrypt-payload';
import { encryptPayload } from './shared/utils/encrypt-payload';
import {
  authTokenSchema,
  connectionTokenSchema,
  sessionIdSchema
} from './socket.schemas';

let io: Server;
let engine: Engine;

const tokenService = new TokenService();

export function initSocket() {
  if (io) return { io, engine };

  io = new Server();
  engine = new Engine();

  io.bind(engine);

  if (configProvider.get('PAYLOAD_ENCRYPTED')) {
    // Inject session ID and encryption key
    io.use(async (socket, next) => {
      logger.warn(
        'Payload encryption is enabled, but encryption logic is not yet implemented. Data will be sent in plaintext.'
      );
      const sid = socket.handshake.auth.sessionId;
      const isValidSessionIdFormat = sessionIdSchema.safeParse(sid);

      if (!isValidSessionIdFormat.success) {
        logger.onlyDev(
          `Session ID format validation failed: ${JSON.stringify(isValidSessionIdFormat.error.issues)}`
        );
        return next(
          new Error('Authentication error: Invalid session ID format')
        );
      }

      if (!sid) {
        logger.warn('Socket connection rejected: No session ID provided');
        return next(new Error('Authentication error: No session ID provided'));
      }

      if (!client.connected) {
        logger.error('Redis client is not connected');
        return next(new Error('Internal server error: Cache unavailable'));
      }

      const key = await client.get(
        `${APP_CONFIG.cache.keys.handshakePrefix}${sid}`
      );

      if (!key) {
        logger.warn(
          'Socket connection rejected: Invalid or expired session ID'
        );
        return next(new Error('Authentication error: Invalid session ID'));
      }

      const result = await client.expire(
        `${APP_CONFIG.cache.keys.handshakePrefix}${sid}`,
        APP_CONFIG.cache.ttl.handshakeSession
      );
      if (result !== 1) {
        logger.warn(
          `Failed to extend TTL for session ${sid} during socket connection`
        );
      }

      const encryptiosnKey = key;
      logger.onlyDev(`Received session ID during socket connection: ${sid}`);
      socket.data.sessionId = sid;
      socket.data.encryptionKey = encryptiosnKey;
      next();
    });
  }

  // Optional JWT token verification middleware for Socket.IO connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.authToken;
      if (!token) {
        logger.warn('Socket connection rejected: No token provided');
        return next();
      }

      console.log(
        `Received token during socket connection: ${token.substring(0, 20)}...`
      );

      if (!token.startsWith('Bearer ')) {
        logger.warn('Socket connection rejected: Invalid token format');
        return next();
      }

      const rawToken = token.replace('Bearer ', '');

      const isValidFormat = authTokenSchema.safeParse(rawToken);
      if (!isValidFormat.success) {
        logger.onlyDev(
          `OPTIONAL authToken format validation failed: ${JSON.stringify(isValidFormat.error.issues)}`
        );
        return next();
      }

      let decodedToken;
      try {
        decodedToken = await verify(
          rawToken,
          configProvider.get('JWT_ACCESS_SECRET'),
          'HS256'
        );
      } catch (err) {
        if (err instanceof JwtTokenExpired) {
          logger.warn('Socket connection rejected: JWT token expired');
          return next();
        }
        logger.warn('Socket connection rejected: JWT verification failed', {
          error: err instanceof Error ? err.message : err
        });
        return next();
      }

      const jwtPayload = decodedToken as jwtPaylaod;

      const repo = new RepositoryFactory().authSessionRepository();
      const validateSession = new ValidateSession(repo);
      const isValid = await validateSession.execute(jwtPayload.sessionId);

      if (!isValid) {
        logger.warn(
          'Socket connection rejected: Invalid session - expired or revoked'
        );
        return next();
      }

      logger.onlyDev(
        `JWT payload for socket connection: ${JSON.stringify(jwtPayload)}`
      );

      socket.data.jwtPayload = jwtPayload;

      next();
    } catch (error) {
      logger.error('Error verifying token during socket connection:', error);
      return next();
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.connectionToken;
      if (!token) {
        logger.warn('Socket connection rejected: No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      const isValidFormat = connectionTokenSchema.safeParse(token);
      if (!isValidFormat.success) {
        logger.onlyDev(
          `Connection token format validation failed: ${JSON.stringify(isValidFormat.error.issues)}`
        );
        return next(new Error('Authentication error: Invalid token format'));
      }

      const connectionTokenData: ConnectionTokenData | null =
        await tokenService.verifyToken(token);

      if (!connectionTokenData) {
        logger.warn(
          'Socket connection rejected: Invalid connection token - expired or malformed'
        );
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.data.connectionTokenData = connectionTokenData;
      const room = io.sockets.adapter.rooms.get(
        connectionTokenData.connectionId
      );
      if (!room || room.size < 2) {
        socket.join(connectionTokenData.connectionId);
      } else {
        logger.warn(
          `Socket connection rejected: Room ${connectionTokenData.connectionId} already has 2 clients.`
        );
        return next(
          new Error('Authentication error: Connection already has 2 clients')
        );
      }

      next();
    } catch (error) {
      logger.error('Error verifying token during socket connection:', error);
      return next(new Error('Authentication error: Token verification failed'));
    }
  });

  io.on('connection', (socket) => {
    if (configProvider.get('PAYLOAD_ENCRYPTED')) {
      socket.use(async (packet, next) => {
        const [_eventName, data] = packet;
        const isEnctyptedFormat = encryptedPayloadSchema.safeParse(data);

        if (!isEnctyptedFormat.success) {
          return next(
            new Error('Data is not encrypted or wrong payload format')
          );
        }

        try {
          const decryptedData = decryptPayload(data, socket.data.encryptionKey);
          logger.onlyDev(
            `Decrypted data for message from ${socket.id}: ${JSON.stringify(decryptedData)}`
          );
          packet[1] = decryptedData;
        } catch (error) {
          if (error instanceof ValidationError) {
            logger.warn(
              `Decryption failed for message from ${socket.id}: ${error.message}`
            );
            return next(new Error(`Decryption failed: ${error.message}`));
          }
          logger.error(
            `Unexpected error during decryption for message from ${socket.id}:`,
            error
          );
          return next(new Error('Decryption failed due to unexpected error'));
        }
        next();
      });
    }

    logger.info(
      `Client connected: ${socket.id} as ${socket.data.connectionTokenData?.role}`
    );

    socket.on('message', (message) => {
      logger.info(
        `[MESSAGE EVENT] Received message from ${socket.id}: ${JSON.stringify(message)}`
      );

      const decryptionKey = Buffer.from(socket.data.encryptionKey, 'base64');

      const payload = encryptPayload(
        {
          ...message,
          news: `Echoing back to ${socket.id} at ${new Date().toISOString()}`
        },
        decryptionKey
      );

      socket.send({ payload });
    });
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return { io, engine };
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function getEngine() {
  if (!engine) {
    throw new Error('Engine not initialized');
  }
  return engine;
}
