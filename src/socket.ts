import logger from '@logger';
import { Server as Engine } from '@socket.io/bun-engine';
import { verify } from 'hono/jwt';
import { JwtTokenExpired } from 'hono/utils/jwt/types';
import { Server, Socket } from 'socket.io';

import { APP_CONFIG } from './config/appConfig';
import { configProvider } from './config/configProvider';
import { client } from './infrastucture/cache/client';
import { RepositoryFactory } from './infrastucture/factories/RepositoryFactory';
import {
  IncomingEventNames,
  IncomingEventPayloads,
  incomingEventSchemas,
  OutgoingEventNames,
  OutgoingEventPayloads
} from './infrastucture/ws/eventMap';
import {
  authTokenSchema,
  connectionTokenSchema,
  sessionIdSchema
} from './infrastucture/ws/schemas/socket.security.schemas';
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

let io: Server;
let engine: Engine;

const tokenService = new TokenService();

/** Socket ID - Encryption Key Mapping */
const keyMapping = new Map<string, string>();

/**
 * Helper function to register event handlers with type safety for incoming events.
 * !Do not use for Reserved events like 'connection', 'disconnect', or 'error'
 * @param socket The Socket.IO socket instance
 * @param event The name of the event to listen for
 * @param handler The callback function that handles the event, with typed data
 */
function on<K extends keyof IncomingEventPayloads>(
  socket: Socket,
  event: K,
  handler: (data: IncomingEventPayloads[K]) => void
) {
  if (!IncomingEventNames.has(event)) {
    throw new Error(`Cannot register handler for reserved event ${event}`);
  }
  // @ts-expect-error - Do not use for Reserved events like 'connection', 'disconnect', or 'error'
  socket.on(event, handler);
  // logger.onlyDev(`Registered handler for event ${event}`);
}

/** Helper function to emit events with type safety for outgoing events. Automatically encrypts payload if encryption is enabled. */
function emit<K extends keyof OutgoingEventPayloads>(
  socket: Socket,
  event: K,
  data: OutgoingEventPayloads[K]
) {
  if (!OutgoingEventNames.has(event)) {
    throw new Error(`Cannot emit reserved event ${event}`);
  }
  if (configProvider.get('PAYLOAD_ENCRYPTED')) {
    const decryptionKey = Buffer.from(socket.data.encryptionKey, 'base64');
    const dataWithEventName = {
      event,
      ...data,
      sentAt: new Date().toISOString()
    };
    const payload = encryptPayload(
      { payload: dataWithEventName },
      decryptionKey
    );
    const finalPayload = { payload: payload };
    logger.onlyDev(
      `[emit] Emitting encrypted payload for event ${event} to ${socket.id}: ${JSON.stringify(finalPayload)}`
    );
    socket.emit(event, finalPayload);
    return;
  }
  socket.emit(event, data);
}

function emitToOtherSocket<K extends keyof OutgoingEventPayloads>(
  socket: Socket,
  roomId: string,
  event: K,
  data: OutgoingEventPayloads[K]
) {
  if (!OutgoingEventNames.has(event)) {
    throw new Error(`Cannot emit reserved event ${event}`);
  }

  if (configProvider.get('PAYLOAD_ENCRYPTED')) {
    const key = keyMapping.get(socket.data.otherSocketId);
    if (!key) {
      logger.error(
        `Encryption key not found for socket ${socket.data.otherSocketId}`
      );
      throw new Error('Encryption key not found for target socket');
    }
    const dataWithEventName = {
      event,
      ...data,
      sentAt: new Date().toISOString()
    };
    const decryptionKey = Buffer.from(key, 'base64');
    const payload = encryptPayload(
      { payload: dataWithEventName },
      decryptionKey
    );
    const finalPayload = { payload: payload };
    logger.onlyDev(
      `[emitToOtherSocket] Emitting encrypted payload for event ${event} to ${socket.id}: ${JSON.stringify(finalPayload)}`
    );
    socket.to(roomId).emit(event, finalPayload);
    return;
  }
  socket.to(roomId).emit(event, data);
}

export function initSocket() {
  if (io) return { io, engine };

  io = new Server();
  engine = new Engine();

  io.bind(engine);

  if (configProvider.get('PAYLOAD_ENCRYPTED')) {
    // Inject session ID and encryption key
    io.use(async (socket, next) => {
      // logger.warn(
      //   'Payload encryption is enabled, but encryption logic is not yet implemented. Data will be sent in plaintext.',
      // );
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
      keyMapping.set(socket.id, encryptiosnKey);
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

      if (!token.startsWith('Bearer ')) {
        logger.warn('Socket connection rejected: Invalid token format');
        return next();
      }

      const rawToken = token.replace('Bearer ', '');

      const isValidFormat = authTokenSchema.safeParse(rawToken);
      if (!isValidFormat.success) {
        // logger.onlyDev(
        //   `OPTIONAL authToken format validation failed: ${JSON.stringify(isValidFormat.error.issues)}`,
        // );
        return next();
      }

      console.log(
        `Received token during socket connection: ${token.substring(0, 20)}...`
      );

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
    // This middleware is required and will reject connections without a valid connection token
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
    const roomId = socket.data.connectionTokenData?.connectionId;
    if (!roomId) {
      logger.warn(
        `Socket ${socket.id} connected without valid connection token data. Disconnecting socket.`
      );
      socket.disconnect(true);
      return;
    }

    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
      logger.warn(
        `Room ${roomId} not found for socket ${socket.id} after connection. Disconnecting socket.`
      );
      socket.disconnect(true);
      return;
    }
    const numClients = room.size;
    if (numClients === 2) {
      const sockets = Array.from(room);
      const socketsInRoon = sockets.map((id) => io.sockets.sockets.get(id));
      socketsInRoon[0]!.data.otherSocketId = socketsInRoon[1]!.id;
      socketsInRoon[1]!.data.otherSocketId = socketsInRoon[0]!.id;
      logger.onlyDev(
        `Two clients connected to room ${roomId}: ${socketsInRoon[0]!.id} and ${socketsInRoon[1]!.id}`
      );
    }

    if (configProvider.get('PAYLOAD_ENCRYPTED')) {
      // Middleware to decrypt incoming messages only if encryption is enabled
      socket.use(async (packet, next) => {
        const [eventName, data] = packet;
        if (!data) {
          logger.warn(
            `Received event ${eventName} with no data from ${socket.id}, skipping decryption. Its completely valid for some events to not have data`
          );
          return next();
        }
        const isEnctyptedFormat = encryptedPayloadSchema.safeParse(data);

        if (!isEnctyptedFormat.success) {
          return next(
            new Error(
              `Data is not encrypted or wrong payload format during ${eventName}`
            )
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
    socket.use((packet, next) => {
      const [eventName, data] = packet;
      logger.info(
        `[EVENT VALIDATOR MIDDLEWARE] ${eventName} from ${socket.id}: ${JSON.stringify(data)}`
      );
      if (!data) {
        logger.warn(
          `Received event ${eventName} with no data from ${socket.id}, skipping decryption. Its completely valid for some events to not have data`
        );
        return next();
      }

      if (
        eventName === 'connection' ||
        eventName === 'disconnect' ||
        eventName === 'error'
      ) {
        logger.onlyDev(`Skipping validation for special event ${eventName}`);
        return next();
      }

      const schema =
        incomingEventSchemas[eventName as keyof typeof incomingEventSchemas];
      if (!schema) {
        logger.warn(
          `No schema defined for event ${eventName}, skipping validation`
        );
        return next(
          new Error(`Unrecognized event: ${eventName}, no validation schema`)
        );
      }
      const result = schema.safeParse(data);
      if (!result.success) {
        logger.warn(
          `Validation failed for event ${eventName} from ${socket.id}: ${JSON.stringify(result.error.issues)}`
        );
        const errorDetails = result.error.issues
          .map((issue) => {
            const path =
              issue.path.length > 0
                ? `['${issue.path.join('.')}' - ${issue.message}]`
                : `[${issue.message}]`;
            return path;
          })
          .join(', ');
        return next(new Error('Invalid event payload: ' + errorDetails));
      }

      packet[1] = result.data;
      next();
    });

    on(socket, 'connection:accept', (data) => {
      logger.info(
        `data Received data from ${socket.id}: ${JSON.stringify(data)}`
      );

      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'connection:accepted',
        data
      );
    });

    on(socket, 'connection:disconnect', (data) => {
      logger.info(
        `data Received data from ${socket.id}: ${JSON.stringify(data)}`
      );

      const payload = {
        ...data
      };

      socket.send({ payload: payload });
    });

    on(socket, 'connection:reject', (data) => {
      logger.info(
        `[connection:reject] data Received data from ${socket.id}: ${JSON.stringify(data)}`
      );

      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'connection:rejected',
        data
      );
    });

    on(socket, 'connection:request-access', (data) => {
      logger.info(
        `data Received data from ${socket.id}: ${JSON.stringify(data)}`
      );
      const role = socket.data.connectionTokenData?.role;

      if (role.toLowerCase() === 'host') {
        logger.warn(
          `Host client ${socket.id} attempted to request access to themselves. Rejecting request.`
        );
        return emit(socket, 'connection:error', {
          message: 'Hosts cannot request access to themselves'
        });
      }

      const room = io.sockets.adapter.rooms.get(
        socket.data.connectionTokenData?.connectionId
      );

      const isHostConnected = room ? room.size === 2 : false;

      if (!isHostConnected) {
        logger.warn(
          `Guest client ${socket.id} attempted to request access, but host is not connected. Rejecting request.`
        );
        return emit(socket, 'connection:error', {
          message: 'Host is not connected. Please try again later.'
        });
      }

      logger.info(
        `Emitting connection:request-access to host in room ${socket.data.connectionTokenData?.connectionId} from ${socket.id}, with payload: ${JSON.stringify(data)}`
      );

      const payload = {
        ...data
      };

      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'connection:request-access',
        payload
      );
    });

    on(socket, 'webrtc:answer', (data) => {
      logger.info(
        `data Received data from ${socket.id}: ${JSON.stringify(data)}`
      );

      const payload = {
        ...data,
        news: `Echoing back to ${socket.id} at ${new Date().toISOString()}`
      };

      socket.send({ payload });
    });

    on(socket, 'webrtc:offer', (data) => {
      logger.info(
        `data Received data from ${socket.id}: ${JSON.stringify(data)}`
      );

      const payload = {
        ...data,
        news: `Echoing back to ${socket.id} at ${new Date().toISOString()}`
      };

      socket.send({ payload });
    });

    on(socket, 'webrtc:ice-candidate', (data) => {
      logger.info(
        `data Received data from ${socket.id}: ${JSON.stringify(data)}`
      );

      const payload = {
        ...data,
        news: `Echoing back to ${socket.id} at ${new Date().toISOString()}`
      };

      socket.send({ payload });
    });

    on(socket, 'webrtc:ready', (data) => {
      logger.info(
        `data Received data from ${socket.id}: ${JSON.stringify(data)}`
      );

      const payload = {
        ...data,
        news: `Echoing back to ${socket.id} at ${new Date().toISOString()}`
      };

      socket.send({ payload });
    });

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
    socket.on('error', (err) => {
      // logger.error(`Socket error from ${socket.id}:`, err);
      socket.emit('error', { message: err.message });
    });

    socket.on('disconnect', () => {
      logger.info(
        `Client disconnected: [${socket.handshake.address ?? 'Unknown IP address'}] - ${socket.id} `
      );
    });

    const p = encryptPayload(
      {
        news: `Welcome, your socket ID is ${socket.id}`
      },
      Buffer.from(socket.data.encryptionKey, 'base64')
    );
    socket.emit('message', { payload: p });
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
