import logger from '@logger';
import { createMiddleware } from 'hono/factory';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { configProvider } from '@/config/configProvider';
import { client } from '@/infrastucture/cache/client';
import { ValidationError } from '@/shared/errors/Specialized/ValidationError';
import { decryptPayload } from '@/shared/utils/decrypt-payload';

import { encryptPayloadSchema } from '../schemas/encryptedPayload.schema';

/**
 * Middleware responsible for automatically decrypting incoming request payloads (body).
 *
 * It acts only if the `PAYLOAD_ENCRYPTED` configuration flag is enabled and
 * operates strictly on requests with the `Content-Type: application/json` header,
 * excluding safe HTTP methods (GET, OPTIONS, HEAD) and specific documentation/handshake paths.
 *
 * When active and applicable, it requires the client to provide an `X-session-id` header,
 * which is used to retrieve a unique session encryption key from the cache (Redis).
 *
 * The incoming data is then decrypted using the AES mechanism, and the `c.req.json` method
 * is overridden within the request context. This ensures that all subsequent application layers
 * (including `zValidator` and route endpoints) work with "clean", fully decrypted data,
 * completely unaware that it was originally encrypted.
 *
 * @returns Bypasses if encryption is disabled, for safe methods, specific paths, or if content type is not JSON.
 * Otherwise, interrupts the flow and returns an appropriate error response:
 * `401 Unauthorized` when `X-session-id` is missing or the session key is invalid/expired,
 * `400 Bad Request` when JSON/payload format is invalid or decryption validation fails,
 * and `500 Internal Server Error` for unexpected infrastructure/runtime failures.
 */
export const decryptBodyPayload = createMiddleware(async (c, next) => {
  const req = c.req;

  // Skip decryption if payload encryption is not enabled
  if (!configProvider.get('PAYLOAD_ENCRYPTED')) {
    return next();
  }

  // Skip decryption for non-JSON requests and safe HTTP methods
  const method = req.method.toUpperCase();
  if (['GET', 'OPTIONS', 'HEAD'].includes(method)) {
    return next();
  }

  // Skip decryption for specific endpoints (e.g., handshake and documentation)
  const excludedPaths = [
    '/crypto/handshake',
    '/docs',
    '/docs/scalar',
    '/docs/ui',
  ];

  if (excludedPaths.some((path) => req.path.endsWith(path))) {
    return next();
  }

  // Skip decryption if Content-Type is not application/json
  const contentType = req.header('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    return next();
  }

  // Validate presence of X-session-id header and retrieve session key from cache and handle errors
  const sessionId = req.header('X-session-id');
  if (!sessionId) {
    return c.json(
      { message: 'Missing X-session-id header' },
      StatusCodes.UNAUTHORIZED,
    );
  }

  if (!client.connected) {
    logger.error('Redis client is not connected');
    return c.json(
      { message: ReasonPhrases.INTERNAL_SERVER_ERROR },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const key = await client.get(`handshake:${sessionId}`);
  if (!key) {
    return c.json(
      { message: 'Invalid or expired session UUID' },
      StatusCodes.UNAUTHORIZED,
    );
  }

  // Attempt to parse JSON body
  let data;
  try {
    data = await req.json();
  } catch {
    return c.json(
      { message: 'Invalid JSON request body' },
      StatusCodes.BAD_REQUEST,
    );
  }

  // Validate the structure of the encrypted payload and handle validation errors
  const result = encryptPayloadSchema.safeParse(data);
  if (!result.success) {
    return c.json(
      { message: 'Data is not encrypted or wrong payload format' },
      StatusCodes.BAD_REQUEST,
    );
  }

  // Attempt to decrypt the payload and handle decryption errors
  let decrypted;
  try {
    decrypted = decryptPayload(data, key);
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn(`Decryption failed: ${error.message}`);
      return c.json({ message: error.message }, StatusCodes.BAD_REQUEST);
    }

    if (error instanceof Error) {
      logger.error(`Unexpected decryption failure: ${error.message}`);
    }

    return c.json(
      { message: ReasonPhrases.INTERNAL_SERVER_ERROR },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  //! WORKAROUND - Modified req.json to return decrypted data for the rest of the handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  c.req.json = async <T = any>() => decrypted as unknown as T;
  await next();
});
