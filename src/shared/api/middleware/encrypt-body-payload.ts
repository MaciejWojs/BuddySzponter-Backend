import logger from '@logger';
import { encryptPayload } from '@shared/utils/encrypt-payload';
import { createMiddleware } from 'hono/factory';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { configProvider } from '@/config/configProvider';
import { client } from '@/infrastucture/cache/client';

export const encryptPayloadBody = createMiddleware(async (c, next) => {
  await next();

  if (!configProvider.get('PAYLOAD_ENCRYPTED')) return;

  const path = c.req.path;
  if (path.endsWith('/docs')) return;

  if (path.endsWith('/crypto/handshake')) return;

  const res = c.res;
  if (!res) return;
  if (res.status === 204) return;

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return;

  let data;

  try {
    data = await res.clone().json();
  } catch {
    // If response is not valid JSON, skip encryption
    return;
  }
  const sessionId = c.req.header('X-session-id');
  if (!sessionId) {
    logger.warn(
      `Encryption required but X-session-id header is missing — path: ${c.req.path}`,
    );
    c.res = c.json(
      { message: 'Missing X-session-id header' },
      StatusCodes.UNAUTHORIZED,
    );
    return;
  }

  if (!client.connected) {
    logger.error(
      'Redis client is not connected — cannot retrieve session encryption key',
    );
    c.res = c.json(
      { message: ReasonPhrases.INTERNAL_SERVER_ERROR },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    return;
  }

  const key = await client.get(`handshake:${sessionId}`);
  if (!key) {
    logger.warn(
      `Encryption required but no session key found for session: ${sessionId} — path: ${c.req.path}`,
    );
    c.res = c.json(
      { message: 'Invalid or expired session UUID' },
      StatusCodes.UNAUTHORIZED,
    );
    return;
  }

  const keyBuffer = Buffer.from(key, 'base64');

  const encrypted = {
    payload: encryptPayload(data, keyBuffer),
  };

  const headers = new Headers(res.headers);

  headers.set('content-type', 'application/json');

  c.res = new Response(JSON.stringify(encrypted), {
    status: res.status,
    headers,
  });
});
