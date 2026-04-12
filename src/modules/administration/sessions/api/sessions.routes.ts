import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { GetSessions } from '../application/use-case/getSessions';
import { TerminateSession } from '../application/use-case/terminateSession';
import { getSessionsRoute, terminateSessionRoute } from './sessions.openapi';

const administrationSessionsRouter = new OpenAPIHono<ENV>({ defaultHook });

administrationSessionsRouter.openapi(getSessionsRoute, async (c) => {
  const query = c.req.valid('query');

  const authSessionRepository = new RepositoryFactory().authSessionRepository();
  const useCase = new GetSessions(authSessionRepository);

  const sessions = await useCase.execute(query);
  return c.json(sessions, StatusCodes.OK);
});

administrationSessionsRouter.openapi(terminateSessionRoute, async (c) => {
  const { id } = c.req.valid('param');

  const authSessionRepository = new RepositoryFactory().authSessionRepository();
  const useCase = new TerminateSession(authSessionRepository);

  try {
    await useCase.execute(id);
    return c.json(
      { message: `Session ${id} terminated successfully` },
      StatusCodes.OK
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'id', error: err.message }]
      });
    }

    if (err instanceof Error && err.message.includes('Failed to persist')) {
      throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: 'InternalServerError',
        cause: [{ field: 'id', error: err.message }]
      });
    }

    throw err;
  }
});

export default administrationSessionsRouter;
