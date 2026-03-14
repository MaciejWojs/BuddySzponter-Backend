import { OpenAPIHono } from '@hono/zod-openapi';
import { randomBytes } from 'crypto';
import { getConnInfo } from 'hono/bun';
import { HTTPException } from 'hono/http-exception';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { client } from '@/infrastucture/cache/client';
import { Password } from '@/modules/users/domain/value-objects';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';
import { ValidationError } from '@/shared/errors/Specialized/ValidationError';
import { IpAddress } from '@/shared/value-objects';

import { ConnectionCreateRoute } from './connection.openapi';

const connectionsRouter = new OpenAPIHono({ defaultHook });

connectionsRouter.openapi(ConnectionCreateRoute, async (c) => {
  const data = c.req.valid('json');
  const info = getConnInfo(c);
  let password;
  try {
    password = await Password.create(data.password);
  } catch (error) {
    if (error instanceof ValidationError) {
      if (error instanceof PasswordValidationError) {
        throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
          message: 'ValidationError',
          cause: [
            {
              field: 'password',
              error: error.message,
            },
          ],
        });
      }
    }
  }
  const reqIpAddress =
    c.req.header('X-Real-IP') ||
    c.req.header('X-Forwarded-For') ||
    info.remote.address;
  if (!reqIpAddress) {
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message: 'Unable to determine client IP address',
    });
  }

  let ipA;

  try {
    ipA = new IpAddress(reqIpAddress);
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(StatusCodes.BAD_REQUEST, {
        message: error.message,
      });
    }
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
  if (!client.connected) {
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
  let keyGenerationSuccess = false;
  let code;
  const conUUID = crypto.randomUUID();
  let expiresAt;

  do {
    code = randomBytes(4).toString('hex'); // 4 bytes -> 8 hex characters
    const result = await client.setnx(
      `connection_code:${code}${password!.value}`,
      JSON.stringify({
        status: 'pending',
        HostIpAddress: ipA.value,
        connectionUUID: conUUID,
        hostFingerprint: data.fingerprint,
        hostId: data.userId,
        connectionAttempts: 0,
      }),
    );

    if (result === 1) {
      keyGenerationSuccess = true;
      const ttlResult = await client.expire(
        `connection_code:${code}${password!.value}`,
        120,
      );
      if (ttlResult !== 1) {
        client.del(`connection_code:${code}${password!.value}`);
        continue; // Retry if setting TTL failed
      }

      expiresAt = new Date(Date.now() + 120 * 1000);
    }
  } while (!keyGenerationSuccess);

  if (!expiresAt) {
    client.del(`connection_code:${code}${password!.value}`);
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Failed to generate connection code',
    });
  }
  const payload = {
    code: code,
    connectionUUID: conUUID,
    expiresAt: expiresAt,
  };

  return c.json(payload, StatusCodes.OK);
});

// You can add more connection-related data here if needed
// connectionsRouter.openapi(ConnectionJoinRoute, async (c) => {
//   // Example validated data access
//   const data = c.req.valid('json');
//   // Implement your connection joining logic here
//   return c.json({ message: 'Connection joined successfully', data });
// });

export default connectionsRouter;
