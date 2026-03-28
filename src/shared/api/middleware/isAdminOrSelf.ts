import { createMiddleware } from 'hono/factory';

import { ENV } from '@/shared/types/honoENV';

export const isAdminOrSelf = createMiddleware<ENV>(async (c, next) => {
  const jwtPayload = c.get('jwt-payload');

  if (!jwtPayload) {
    c.status(401);
    return c.json({ message: 'Unauthorized' });
  }

  if (jwtPayload.role.toLowerCase() === 'admin') {
    await next();
    return;
  }

  const targetUserId = Number(c.req.param('id'));
  const requesterUserId = jwtPayload.userId;

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    c.status(422);
    return c.json({ message: 'ValidationError' });
  }

  if (requesterUserId !== targetUserId) {
    c.status(403);
    return c.json({ message: 'Forbidden' });
  }

  await next();
});
