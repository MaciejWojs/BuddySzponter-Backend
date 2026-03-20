import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { APP_CONFIG } from '@/config/appConfig';
import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import { mapToDeviceInput } from '@/modules/connection/application/mappers/deviceInputMapper';
import { CreateConnection } from '@/modules/connection/application/use-cases/createConnection';
import { JoinConnection } from '@/modules/connection/application/use-cases/joinConnection';
import {
  ConnectionAlreadyOccupiedError,
  ConnectionCreateRetriesExceededError,
  ConnectionJoinAttemptsExceededError,
  ConnectionNotFoundError,
  ConnectionNotJoinableError,
  InvalidConnectionPasswordError,
} from '@/modules/connection/domain/error/ConnectionBusinessErrors';
import { ConnectionCode } from '@/modules/connection/domain/value-objects';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';
import { ENV } from '@/shared/types/honoENV';

import {
  ConnectionCreateRoute,
  ConnectionJoinRoute,
} from './connection.openapi';

const connectionsRouter = new OpenAPIHono<ENV>({ defaultHook });

connectionsRouter.openapi(ConnectionCreateRoute, async (c) => {
  const repoFactory = new RepositoryFactory();
  const connectionRepo = repoFactory.connectionRepository();
  const createConnectionUseCase = new CreateConnection(connectionRepo);
  const data = c.req.valid('json');
  const ipAddress = c.get('client-ip');

  if (!ipAddress) {
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Unable to determine client IP address',
    });
  }
  let device;
  try {
    device = mapToDeviceInput(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: error.message,
      });
    }

    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }

  try {
    const connection = await createConnectionUseCase.execute({
      password: data.password,
      ipAddress,
      device,
    });

    const expiresAt = new Date(
      Date.now() + APP_CONFIG.connection.cache.ttl.pendingCodeSeconds * 1000,
    );

    const payload = {
      code: connection.code.value,
      connectionUUID: connection.id.value,
      expiresAt,
    };

    return c.json(payload, StatusCodes.OK);
  } catch (error) {
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

    if (error instanceof ConnectionCreateRetriesExceededError) {
      throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: error.message,
      });
    }

    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
});

connectionsRouter.openapi(ConnectionJoinRoute, async (c) => {
  const repoFactory = new RepositoryFactory();
  const connectionRepo = repoFactory.connectionRepository();
  const joinConnectionUseCase = new JoinConnection(connectionRepo);
  const data = c.req.valid('json');
  const ipAddress = c.get('client-ip');

  if (!ipAddress) {
    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Unable to determine client IP address',
    });
  }
  let device;
  try {
    device = mapToDeviceInput(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: error.message,
      });
    }

    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }

  let code: ConnectionCode;
  try {
    code = new ConnectionCode(data.connectionCode);
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: error.message,
      });
    }

    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }

  try {
    const connection = await joinConnectionUseCase.execute({
      code,
      password: data.password,
      device,
      ipAddress,
    });

    return c.json({ connectionUUID: connection.id.value }, StatusCodes.OK);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }

    if (error instanceof ConnectionNotFoundError) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'Invalid connection code',
      });
    }

    if (error instanceof InvalidConnectionPasswordError) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'Incorrect password',
      });
    }

    if (error instanceof ConnectionJoinAttemptsExceededError) {
      throw new HTTPException(StatusCodes.TOO_MANY_REQUESTS, {
        message: 'Too many attempts',
      });
    }

    if (
      error instanceof ConnectionAlreadyOccupiedError ||
      error instanceof ConnectionNotJoinableError
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: error.message,
      });
    }

    throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
});

export default connectionsRouter;
