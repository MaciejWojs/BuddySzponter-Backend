import logger from '@logger';
import { createMiddleware } from 'hono/factory';
import { StatusCodes } from 'http-status-codes';

import { configProvider } from '@/config/configProvider';
import { client } from '@/infrastucture/cache/client';

const SESSION_DURATION_SECONDS = 900;

export const extendEncryptionKeyTTL = createMiddleware(async (c, next) => {
  await next();

  if (!configProvider.get('PAYLOAD_ENCRYPTED')) {
    await next();
    return;
  }

  const sessionId = c.req.header('X-session-id');
  if (!sessionId) return;

  if (c.res.status !== StatusCodes.OK) return;
  const result = await client.expire(
    `handshake:${sessionId}`,
    SESSION_DURATION_SECONDS,
  );

  if (result !== 1) {
    logger.warn(`Failed to extend TTL for session ${sessionId}`);
  }
});
