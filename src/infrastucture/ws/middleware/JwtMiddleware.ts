import logger from '@logger';
import { verify } from 'hono/jwt';
import { JwtTokenExpired } from 'hono/utils/jwt/types';

import { configProvider } from '@/config/configProvider';
import { ValidateSession } from '@/modules/auth/application/use-cases/validateSession';
import { jwtPaylaod } from '@/shared/types/jwtPayload';
import { IoMiddlewareParams } from '@/shared/types/ws';

import { authTokenSchema } from '../schemas/socket.security.schemas';
import { BaseMiddleware } from './BaseMiddleware';
import { ISocketMiddleware } from './ISocketMiddleware';

export class JwtMiddleware
  extends BaseMiddleware<IoMiddlewareParams>
  implements ISocketMiddleware
{
  private validateSessionUseCase: ValidateSession;

  constructor(validateSessionUseCase: ValidateSession) {
    super();
    this.validateSessionUseCase = validateSessionUseCase;
  }

  override async use(...args: IoMiddlewareParams): Promise<void> {
    const [socket, next] = args;
    try {
      const token = socket.handshake.auth.authToken;

      if (!token) {
        return next();
      }

      if (!token.startsWith('Bearer ')) {
        return next();
      }

      const rawToken = token.replace('Bearer ', '');

      const isValidFormat = authTokenSchema.safeParse(rawToken);
      if (!isValidFormat.success) {
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

      const isValid = await this.validateSessionUseCase.execute(
        jwtPayload.sessionId
      );

      if (!isValid) {
        logger.warn(
          'Socket connection rejected: Invalid session - expired or revoked'
        );
        return next();
      }

      socket.data.jwtPayload = jwtPayload;
      next();
    } catch (error) {
      logger.error('Error verifying token during socket connection:', error);
      return next();
    }
  }
}
