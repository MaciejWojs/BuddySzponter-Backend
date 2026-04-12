import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { CreateVersion } from '../application/use-case/createVersion';
import { DeleteVersion } from '../application/use-case/deleteVersion';
import { GetVersionById } from '../application/use-case/getVersionById';
import { GetVersions } from '../application/use-case/getVersions';
import { GetVersionsTotal } from '../application/use-case/getVersionsTotal';
import { UpdateVersion } from '../application/use-case/updateVersion';
import {
  createVersionRoute,
  deleteVersionRoute,
  getVersionByIdRoute,
  getVersionsRoute,
  getVersionsTotalRoute,
  updateVersionRoute,
} from './versions.openapi';

const administrationSystemVersionsRouter = new OpenAPIHono<ENV>({
  defaultHook,
});

administrationSystemVersionsRouter.openapi(getVersionsTotalRoute, async (c) => {
  const coreDao = new DaoFactory().db.coreDao();
  const useCase = new GetVersionsTotal(coreDao);

  const total = await useCase.execute();
  return c.json({ total }, StatusCodes.OK);
});

administrationSystemVersionsRouter.openapi(getVersionsRoute, async (c) => {
  const query = c.req.valid('query');
  const coreDao = new DaoFactory().db.coreDao();
  const useCase = new GetVersions(coreDao);

  const versions = await useCase.execute(query);
  return c.json(versions, StatusCodes.OK);
});

administrationSystemVersionsRouter.openapi(getVersionByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const coreDao = new DaoFactory().db.coreDao();
  const useCase = new GetVersionById(coreDao);

  try {
    const version = await useCase.execute(id);
    return c.json(version, StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'id', error: err.message }],
      });
    }
    throw err;
  }
});

administrationSystemVersionsRouter.openapi(createVersionRoute, async (c) => {
  const data = c.req.valid('json');
  const coreDao = new DaoFactory().db.coreDao();
  const useCase = new CreateVersion(coreDao);

  try {
    await useCase.execute(data);
    return c.json(
      { message: `Version ${data.version} created successfully` },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'App version already exists') {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'version', error: err.message }],
      });
    }
    throw err;
  }
});

administrationSystemVersionsRouter.openapi(updateVersionRoute, async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const coreDao = new DaoFactory().db.coreDao();
  const useCase = new UpdateVersion(coreDao);

  try {
    await useCase.execute(id, data);
    return c.json(
      { message: `Version with ID ${id} updated successfully` },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'App version already exists') {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'version', error: err.message }],
      });
    }

    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'id', error: err.message }],
      });
    }

    throw err;
  }
});

administrationSystemVersionsRouter.openapi(deleteVersionRoute, async (c) => {
  const { id } = c.req.valid('param');
  const coreDao = new DaoFactory().db.coreDao();
  const useCase = new DeleteVersion(coreDao);

  try {
    await useCase.execute(id);
    return c.json(
      { message: `Version with ID ${id} deleted successfully` },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'id', error: err.message }],
      });
    }
    throw err;
  }
});

export default administrationSystemVersionsRouter;
