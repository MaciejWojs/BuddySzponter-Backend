import { encryptPayload } from '@shared/utils/encrypt-payload';
import { createMiddleware } from 'hono/factory';

import { configProvider } from '@/config/configProvider';

export const encryptPayloadBody = createMiddleware(async (c, next) => {
  await next();

  if (!configProvider.get('PAYLOAD_ENCRYPTED')) return;

  const path = c.req.path;
  if (path.endsWith('/docs')) return;

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

  const encrypted = {
    payload: encryptPayload(data),
  };

  const headers = new Headers(res.headers);

  headers.set('content-type', 'application/json');

  c.res = new Response(JSON.stringify(encrypted), {
    status: res.status,
    headers,
  });
});
