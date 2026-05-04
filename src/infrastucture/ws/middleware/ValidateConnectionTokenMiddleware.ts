import { Server } from 'socket.io';

import {
  recordSocketConnectionAttempt,
  recordSocketConnectionRejected
} from '@/core/infrastucture/metrics';
import logger from '@/infrastucture/logger';
import {
  ConnectionTokenData,
  TokenService
} from '@/modules/connection/application/TokenService';
import { IoMiddlewareParams } from '@/shared/types/ws';

import { connectionTokenSchema } from '../schemas/socket.security.schemas';
import { BaseMiddleware } from './BaseMiddleware';
import { ISocketMiddleware } from './ISocketMiddleware';

export class ValidateConnectionTokenMiddleware
  extends BaseMiddleware<IoMiddlewareParams>
  implements ISocketMiddleware
{
  private readonly io;

  private readonly tokenService;

  constructor(tokenService: TokenService, io: Server) {
    super();
    this.tokenService = tokenService;
    this.io = io;
  }

  override async use(...args: IoMiddlewareParams): Promise<void> {
    const [socket, next] = args;

    try {
      const token = socket.handshake.auth.connectionToken;
      if (!token) {
        logger.warn('Socket connection rejected: No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      // Host-guest attempt starts only when a connection token is provided.
      recordSocketConnectionAttempt();

      const isValidFormat = connectionTokenSchema.safeParse(token);
      if (!isValidFormat.success) {
        logger.onlyDev(
          `Connection token format validation failed: ${JSON.stringify(isValidFormat.error.issues)}`
        );
        recordSocketConnectionRejected('invalid_token_format');
        return next(new Error('Authentication error: Invalid token format'));
      }

      const verifiedTokenData: ConnectionTokenData | null =
        await this.tokenService.verifyToken(token);

      if (!verifiedTokenData) {
        logger.warn(
          'Socket connection rejected: Invalid connection token - expired or malformed'
        );
        recordSocketConnectionRejected('invalid_or_expired_token');
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.data.connectionTokenData = verifiedTokenData;

      const room = this.io.sockets.adapter.rooms.get(
        verifiedTokenData.connectionId
      );
      if (!room || room.size < 2) {
        socket.join(verifiedTokenData.connectionId);
      } else {
        const existingSockets = Array.from(room)
          .map((socketId) => this.io.sockets.sockets.get(socketId))
          .filter((s): s is NonNullable<typeof s> => Boolean(s));

        const reconnectingSocket = existingSockets.find(
          (existingSocket) =>
            existingSocket.data.connectionTokenData?.deviceId ===
              verifiedTokenData.deviceId &&
            existingSocket.data.connectionTokenData?.role ===
              verifiedTokenData.role
        );

        if (reconnectingSocket) {
          logger.info(
            `Replacing stale socket ${reconnectingSocket.id} with reconnecting socket ${socket.id} for connection ${verifiedTokenData.connectionId}`
          );
          reconnectingSocket.disconnect(true);
          socket.join(verifiedTokenData.connectionId);
        } else {
          logger.warn(
            `Socket connection rejected: Room ${verifiedTokenData.connectionId} already has 2 clients.`
          );
          recordSocketConnectionRejected('room_full');
          return next(
            new Error('Authentication error: Connection already has 2 clients')
          );
        }
      }

      const refreshedTokenData =
        await this.tokenService.markTokenForReconnect(token);
      if (!refreshedTokenData) {
        logger.warn(
          `Socket connection rejected: Token race detected for socket ${socket.id}`
        );
        recordSocketConnectionRejected('invalid_or_expired_token');
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.data.connectionTokenData = refreshedTokenData;

      next();
    } catch (error) {
      logger.error('Error verifying token during socket connection:', error);
      recordSocketConnectionRejected('token_verification_failed');
      return next(new Error('Authentication error: Token verification failed'));
    }
  }
}
