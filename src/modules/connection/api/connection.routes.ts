import { OpenAPIHono, z } from '@hono/zod-openapi';
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

import {
  ConnectionCreateRoute,
  ConnectionJoinRoute,
} from './connection.openapi';

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

    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
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
      `connection_code:${code}`,
      JSON.stringify({
        status: 'pending',
        HostIpAddress: ipA.value,
        password: password!.value,
        connectionUUID: conUUID,
        hostFingerprint: data.fingerprint,
        hostId: data.userId,
      }),
    );

    if (result === 1) {
      const ttlResult = await client.expire(`connection_code:${code}`, 120);
      if (ttlResult !== 1) {
        try {
          await client.del(`connection_code:${code}`);
        } catch {
          throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: 'Failed to clean up invalid connection code',
          });
        }
        continue; // Retry if setting TTL failed
      }

      expiresAt = new Date(Date.now() + 120 * 1000);
      try {
        const attemptsSetResult = await client.setex(
          `connection_attempts:${code}`,
          120,
          '0',
        );

        if (attemptsSetResult !== 'OK') {
          await client.del(`connection_code:${code}`);
          continue;
        }
      } catch {
        await client.del(`connection_code:${code}`);
        continue;
      }

      keyGenerationSuccess = true;
    }
  } while (!keyGenerationSuccess);

  if (!expiresAt) {
    await client.del(`connection_code:${code}`);
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

connectionsRouter.openapi(ConnectionJoinRoute, async (c) => {
  const data = c.req.valid('json');
  const connectionCode = data.connectionCode;

  const key = `connection_code:${connectionCode}`;
  const attemptsKey = `connection_attempts:${connectionCode}`;

  if (!client.connected) {
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }

  const connectionDataRaw = await client.get(key);

  if (!connectionDataRaw) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'Invalid connection code',
    });
  }

  let connectionData;
  try {
    connectionData = JSON.parse(connectionDataRaw);
  } catch {
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Failed to parse connection data',
    });
  }

  const attemptsRaw = await client.get(attemptsKey);
  const attempts = attemptsRaw ? Number.parseInt(attemptsRaw, 10) : 0;

  if (Number.isNaN(attempts)) {
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Failed to parse connection attempts',
    });
  }

  if (attempts > 5) {
    throw new HTTPException(StatusCodes.TOO_MANY_REQUESTS, {
      message: 'Too many attempts',
    });
  }

  const storedPassword = Password.fromHash(connectionData.password);
  if (!(await storedPassword.verify(data.password))) {
    await client.incr(attemptsKey);

    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'Incorrect password',
    });
  }

  await client.del(attemptsKey);

  const UUID = z.uuid().safeParse(connectionData.connectionUUID);
  if (!UUID.success) {
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Invalid connection UUID format',
    });
  }

  const payload = { connectionUUID: UUID.data };
  return c.json(payload, StatusCodes.OK);
});

export default connectionsRouter;
