import logger from '@logger';
import { Server as Engine } from '@socket.io/bun-engine';
import { Server, Socket } from 'socket.io';

import { configProvider } from './config/configProvider';
import { RepositoryFactory } from './infrastucture/factories/RepositoryFactory';
import {
  IncomingEventNames,
  IncomingEventPayloads,
  OutgoingEventNames,
  OutgoingEventPayloads
} from './infrastucture/ws/eventMap';
import { DecryptEventPayloadMiddleware } from './infrastucture/ws/middleware/DecryptEventPayloadMIddleware';
import { EncryptionSessionMiddleware } from './infrastucture/ws/middleware/EncryptionSessionMiddleware';
import { EventValidatorMiddleware } from './infrastucture/ws/middleware/EventValidatorMiddleware';
import { JwtMiddleware } from './infrastucture/ws/middleware/JwtMiddleware';
import { ValidateConnectionTokenMiddleware } from './infrastucture/ws/middleware/ValidateConnectionTokenMiddleware';
import { ValidateSession } from './modules/auth/application/use-cases/validateSession';
import { TokenService } from './modules/connection/application/TokenService';
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
    const sessionMiddleware = new EncryptionSessionMiddleware();
    io.use(sessionMiddleware.use.bind(sessionMiddleware));
  }

  const repo = new RepositoryFactory().authSessionRepository();
  const validateSession = new ValidateSession(repo);
  const jwtMiddleware = new JwtMiddleware(validateSession);
  // Optional JWT token verification middleware for Socket.IO connections
  io.use(jwtMiddleware.use.bind(jwtMiddleware));

  const connTokenMiddleware = new ValidateConnectionTokenMiddleware(
    tokenService,
    io
  );
  // This middleware is required and will reject connections without a valid connection token
  io.use(connTokenMiddleware.use.bind(connTokenMiddleware));

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
      const decryptMiddleware = new DecryptEventPayloadMiddleware(socket);
      socket.use(decryptMiddleware.use.bind(decryptMiddleware));
    }
    const eventValidatorMiddleware = new EventValidatorMiddleware(socket);
    socket.use(eventValidatorMiddleware.use.bind(eventValidatorMiddleware));

    // host -> server -> guest
    on(socket, 'connection:accept', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
      );

      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'connection:accepted',
        data
      );
    });

    // guest or host -> server -> the other party
    on(socket, 'connection:disconnect', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
      );

      const payload = {
        ...data
      };

      socket.send({ payload: payload });
    });

    // host -> server -> guest
    on(socket, 'connection:reject', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
      );

      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'connection:rejected',
        data
      );
    });

    // guest -> server -> host
    on(socket, 'connection:request-access', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
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

      // host -> server -> guest
      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'connection:request-access',
        payload
      );
    });

    // guest -> server -> host
    on(socket, 'connection:acknowledge', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
      );
      const role = socket.data.connectionTokenData?.role;

      if (role.toLowerCase() === 'host') {
        logger.warn(
          `Host client ${socket.id} attempted to request access to themselves. Rejecting request.`
        );
        return emit(socket, 'connection:error', {
          message: 'Hosts cannot acknowledge connection to themselves'
        });
      }

      const responseEvent = 'connection:acknowledged';

      logger.info(
        `[${role}] [${data.event}] data from ${socket.id} with role: ${role}: ${JSON.stringify(data)}, emitting event ${responseEvent} to host in room ${socket.data.connectionTokenData?.connectionId}`
      );
      
      // server -> host
      emitToOtherSocket(
        socket,
        data.sessionId,
        responseEvent,
        data
      );
    });

    // host -> server (after connection:acknowledged sent by server)
    on(socket, 'connection:acknowledged', (data) => {
      const role = socket.data.connectionTokenData?.role;

      if (role.toLowerCase() === 'guest') {
        logger.warn(
          `Guest client ${socket.id} attempted to acknowledge connection to themselves. Rejecting request.`
        );
        return emit(socket, 'connection:error', {
          message: 'Guest cannot acknowledge connection to themselves'
        });
      }
      logger.info(
        `[${role}] [${data.event}] data from ${socket.id} with role: ${role}: ${JSON.stringify(data)}`
      );
    });

    on(socket, 'webrtc:answer', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
      );

      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'webrtc:answer',
        data
      );
    });

    on(socket, 'webrtc:offer', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
      );

      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'webrtc:offer',
        data
      );
    });

    on(socket, 'webrtc:ice-candidate', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
      );
      emitToOtherSocket(
        socket,
        socket.data.connectionTokenData!.connectionId,
        'webrtc:ice-candidate',
        data
      );
    });

    on(socket, 'webrtc:ready', (data) => {
      logger.info(
        `[${data.event}] data from ${socket.id}: ${JSON.stringify(data)}`
      );
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

    const partialPayload = {
      news: `Welcome, your socket ID is ${socket.id}`
    };

    const p = configProvider.get('PAYLOAD_ENCRYPTED')
      ? encryptPayload(
          partialPayload,
          Buffer.from(socket.data.encryptionKey, 'base64')
        )
      : partialPayload;
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
