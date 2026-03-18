import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { getSupportedVersionsRoute } from './core.openapi';

const coreRouter = new OpenAPIHono({ defaultHook });

coreRouter.openapi(getSupportedVersionsRoute, async (c) => {
  const daoFactory = new DaoFactory();
  const coreDao = daoFactory.db.coreDao();

  const versions = await coreDao.findSupportedVersions();

  return c.json(versions, StatusCodes.OK);
});

export default coreRouter;
