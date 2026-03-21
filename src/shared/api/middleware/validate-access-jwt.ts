import { createMiddleware } from 'hono/factory';

import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import { ValidateSession } from '@/modules/auth/application/use-cases/validateSession';
import { ENV } from '@/shared/types/honoENV';

/**
 * Validates whether the current access token session is still active.
 *
 * This middleware depends on `injectJwtPayload` and must run after it,
 * because it reads `jwt-payload` from the request context.
 */
export const validateAccessJWT = createMiddleware<ENV>(async (c, next) => {
  const jwtPayload = c.get('jwt-payload');

  if (!jwtPayload) {
    await next();
    return;
  }

  const sessionId = jwtPayload.sessionId;
  const repo = new RepositoryFactory().authSessionRepository();
  const validateSession = new ValidateSession(repo);
  const isValid = await validateSession.execute(sessionId);

  if (!isValid) {
    c.set('jwt-payload', null);
  }
  await next();
});
