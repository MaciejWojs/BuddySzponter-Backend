import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { GetActiveSocketConnections } from '../application/use-case/getActiveSocketConnections';
import { KickSocketFromConnection } from '../application/use-case/kickSocketFromConnection';
import { TerminateSocketConnection } from '../application/use-case/terminateSocketConnection';
import {
  getActiveSocketConnectionsRoute,
  kickSocketFromConnectionRoute,
  terminateSocketConnectionRoute
} from './sockets.openapi';

const administrationSystemSocketsRouter = new OpenAPIHono<ENV>({ defaultHook });

administrationSystemSocketsRouter.openapi(
  getActiveSocketConnectionsRoute,
  async (c) => {
    const useCase = new GetActiveSocketConnections();
    const connections = await useCase.execute();
    return c.json(connections, StatusCodes.OK);
  }
);

administrationSystemSocketsRouter.openapi(
  terminateSocketConnectionRoute,
  async (c) => {
    const { connectionId } = c.req.valid('param');
    const useCase = new TerminateSocketConnection();

    try {
      const disconnectedSockets = useCase.execute(connectionId);

      return c.json(
        {
          message: `Connection ${connectionId} terminated successfully`,
          disconnectedSockets
        },
        StatusCodes.OK
      );
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) {
        throw new HTTPException(StatusCodes.NOT_FOUND, {
          message: 'NotFoundError',
          cause: [{ field: 'connectionId', error: err.message }]
        });
      }

      throw err;
    }
  }
);

administrationSystemSocketsRouter.openapi(
  kickSocketFromConnectionRoute,
  async (c) => {
    const { connectionId, socketId } = c.req.valid('param');
    const useCase = new KickSocketFromConnection();

    try {
      useCase.execute(connectionId, socketId);

      return c.json(
        {
          message: `Socket ${socketId} kicked from connection ${connectionId} successfully`
        },
        StatusCodes.OK
      );
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) {
        throw new HTTPException(StatusCodes.NOT_FOUND, {
          message: 'NotFoundError',
          cause: [{ field: 'socketId', error: err.message }]
        });
      }

      if (err instanceof Error && err.message.includes('is not part of')) {
        throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
          message: 'ValidationError',
          cause: [{ field: 'connectionId', error: err.message }]
        });
      }

      throw err;
    }
  }
);

export default administrationSystemSocketsRouter;
