import logger from '@logger';

import { APP_CONFIG } from '@/config/appConfig';
import { client } from '@/infrastucture/cache/client';
import { IoMiddlewareParams } from '@/shared/types/ws';

import { sessionIdSchema } from '../schemas/socket.security.schemas';
import { EncryptionService } from '../services/EncryptionService';
import { BaseMiddleware } from './BaseMiddleware';
import { ISocketMiddleware } from './ISocketMiddleware';

export class EncryptionSessionMiddleware
  extends BaseMiddleware<IoMiddlewareParams>
  implements ISocketMiddleware
{
  private encryptionService: EncryptionService;

  constructor() {
    super();
    this.encryptionService = EncryptionService.getInstance();
  }

  override async use(...args: IoMiddlewareParams): Promise<void> {
    const [socket, next] = args;

    if (!client.connected) {
      logger.error(
        '[EncryptionSessionMiddleware] Redis client is not connected!'
      );
      return next(new Error('Internal server error: Cache unavailable'));
    }

    const sid = socket.handshake.auth.sessionId;
    if (!sid) {
      logger.warn(
        '[EncryptionSessionMiddleware] Socket connection rejected: No session ID provided'
      );
      return next(new Error('Authentication error: No session ID provided'));
    }

    const isValidSessionIdFormat = sessionIdSchema.safeParse(sid);
    if (!isValidSessionIdFormat.success) {
      logger.onlyDev(
        `[EncryptionSessionMiddleware] Session ID format validation failed: ${JSON.stringify(isValidSessionIdFormat.error.issues)}`
      );
      return next(new Error('Authentication error: Invalid session ID format'));
    }

    const key = await client.get(
      `${APP_CONFIG.cache.keys.handshakePrefix}${sid}`
    );

    if (!key) {
      logger.warn(
        '[EncryptionSessionMiddleware] Socket connection rejected: Invalid or expired session ID'
      );
      return next(new Error('Authentication error: Invalid session ID'));
    }

    const result = await client.expire(
      `${APP_CONFIG.cache.keys.handshakePrefix}${sid}`,
      APP_CONFIG.cache.ttl.handshakeSession
    );
    if (result !== 1) {
      logger.warn(
        `[EncryptionSessionMiddleware] Failed to extend TTL for session ${sid} during socket connection`
      );
    }

    const encryptiosnKey = key;
    this.encryptionService.setKey(socket.id, encryptiosnKey);
    logger.onlyDev(`Received session ID during socket connection: ${sid}`);
    socket.data.sessionId = sid;
    socket.data.encryptionKey = encryptiosnKey;
    next();
  }
}
