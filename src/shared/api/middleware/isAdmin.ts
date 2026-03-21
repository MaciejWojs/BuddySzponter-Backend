import { createMiddleware } from 'hono/factory';

import { ENV } from '@/shared/types/honoENV';

export const isAdmin = createMiddleware<ENV>(async (c, next) => {
  const jwtPayload = c.get('jwt-payload');
  if (!jwtPayload) {
    c.status(401);
    return c.json({ message: 'Unauthorized' });
  }
  if (jwtPayload.role.toLowerCase() !== 'admin') {
    c.status(403);
    return c.json({ message: 'Forbidden' });
  }
  await next();
});
