import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

import { configProvider } from '@/config/configProvider';
import { ENV } from '@/shared/types/honoENV';
import { jwtPaylaod } from '@/shared/types/jwtPayload';

export const injectJwtPayload = createMiddleware<ENV>(async (c, next) => {
  if (c.req.header('Authorization')) {
    const authHeader = c.req.header('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    try {
      const decodedPayload = await verify(
        token,
        configProvider.get('JWT_ACCESS_SECRET'),
        'HS256'
      );
      const { sub: userId, role, sessionId } = decodedPayload as jwtPaylaod;
      c.set('jwt-payload', { userId, role, sessionId });
    } catch {
      c.set('jwt-payload', null);
    }
  }
  await next();
});
