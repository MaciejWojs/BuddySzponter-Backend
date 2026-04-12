import { Server } from 'socket.io';

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

      const isValidFormat = connectionTokenSchema.safeParse(token);
      if (!isValidFormat.success) {
        logger.onlyDev(
          `Connection token format validation failed: ${JSON.stringify(isValidFormat.error.issues)}`
        );
        return next(new Error('Authentication error: Invalid token format'));
      }

      const connectionTokenData: ConnectionTokenData | null =
        await this.tokenService.verifyToken(token);

      if (!connectionTokenData) {
        logger.warn(
          'Socket connection rejected: Invalid connection token - expired or malformed'
        );
        return next(new Error('Authentication error: Invalid token'));
      }

      await this.tokenService.revokeToken(
        token,
        connectionTokenData.connectionId
      );

      socket.data.connectionTokenData = connectionTokenData;

      const room = this.io.sockets.adapter.rooms.get(
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
  }
}
