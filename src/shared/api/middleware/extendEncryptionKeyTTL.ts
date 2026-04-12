import logger from '@logger';
import { createMiddleware } from 'hono/factory';
import { StatusCodes } from 'http-status-codes';

import { APP_CONFIG } from '@/config/appConfig';
import { configProvider } from '@/config/configProvider';
import { client } from '@/infrastucture/cache/client';

export const extendEncryptionKeyTTL = createMiddleware(async (c, next) => {
  if (!configProvider.get('PAYLOAD_ENCRYPTED')) {
    await next();
    return;
  }

  await next();

  const sessionId = c.req.header(APP_CONFIG.headers.sessionId);
  if (!sessionId) return;

  const status = c.res.status;

  if (!client.connected) {
    logger.warn(
      `Redis disconnected, skipping TTL extension for session ${sessionId}`
    );
    return;
  }

  if (status >= StatusCodes.OK && status < StatusCodes.MULTIPLE_CHOICES) return;

  try {
    const result = await client.expire(
      `${APP_CONFIG.cache.keys.handshakePrefix}${sessionId}`,
      APP_CONFIG.cache.ttl.handshakeSession
    );

    if (result !== 1) {
      logger.warn(`Failed to extend TTL for session ${sessionId}`);
    }
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'unknown error';
    logger.warn(
      `Error while extending TTL for session ${sessionId}: ${errMessage}`
    );
  }
});
