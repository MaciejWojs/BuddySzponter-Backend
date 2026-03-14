import { createMiddleware } from 'hono/factory';

import { configProvider } from '@/config/configProvider';
import { client } from '@/infrastucture/cache/client';
import { decryptPayload } from '@/shared/utils/decrypt-payload';

import { encryptPayloadSchema } from '../schemas/encryptedPayload.schema';

/**
 * Middleware responsible for automatically decrypting incoming request payloads (body).
 *
 * It acts only if the `PAYLOAD_ENCRYPTED` configuration flag is enabled and
 * operates strictly on requests with the `Content-Type: application/json` header.
 * When active, it requires the client to provide an `X-session-id` header, which is used
 * to retrieve a unique session key from the cache (Redis).
 *
 * The incoming data is then decrypted using the AES mechanism, and the `c.req.json` method
 * is overridden within the request context. This ensures that all subsequent application layers
 * (including `zValidator` and route endpoints) work with "clean", fully decrypted data,
 * completely unaware that it was originally encrypted.
 *
 * @returns Bypasses if encryption is disabled or content type is not JSON.
 * Otherwise, interrupts the flow and returns a `400 Bad Request` error
 * if a valid session is missing or its key has expired.
 */
export const decryptBodyPayload = createMiddleware(async (c, next) => {
  const req = c.req;

  if (!configProvider.get('PAYLOAD_ENCRYPTED')) {
    await next();
    return;
  }

  if (req.header('Content-Type') !== 'application/json') {
    await next();
    return;
  }

  const sessionId = req.header('X-session-id');
  if (!sessionId) {
    await next();
    return;
  }

  const key = await client.get(`handshake:${sessionId}`);
  if (!key) {
    return c.json({ message: 'Invalid or expired session UUID' }, 400);
  }

  const data = await req.json();

  const result = encryptPayloadSchema.safeParse(data);

  if (!result.success) {
    return c.json(
      { message: 'Data is not encrypted or wrong payload format' },
      400,
    );
  }

  const decrypted = decryptPayload(data, key!);

  //! WORKAROUND - Modified req.json to return decrypted data for the rest of the handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  c.req.json = async <T = any>() => decrypted as unknown as T;

  await next();
});
