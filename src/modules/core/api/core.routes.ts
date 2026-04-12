import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { GetLocale } from '../application/use-cases/getLocale';
import { GetSupportedLocalesByVersion } from '../application/use-cases/getSupportedLocalesByVersion';
import { GetSupportedVersions } from '../application/use-cases/getSupportedVersions';
import { CoreRepository } from '../infrastructure/repositories/CoreRepository';
import {
  getCoreLocaleRoute,
  getSupportedLocalesRoute,
  getSupportedVersionsRoute
} from './core.openapi';

const coreRouter = new OpenAPIHono({ defaultHook });

coreRouter.openapi(getSupportedVersionsRoute, async (c) => {
  const daoFactory = new DaoFactory();
  const coreDao = daoFactory.db.coreDao();
  const coreRepository = new CoreRepository(coreDao);
  const getSupportedVersions = new GetSupportedVersions(coreRepository);

  const versions = await getSupportedVersions.execute();
  const responseData = versions.map((v) => ({
    version: v.version.value,
    codename: v.codename,
    isSupported: v.isSupported
  }));
  return c.json(responseData, StatusCodes.OK);
});

coreRouter.openapi(getCoreLocaleRoute, async (c) => {
  const { lang, version } = c.req.valid('query');
  const daoFactory = new DaoFactory();
  const coreDao = daoFactory.db.coreDao();
  const coreRepository = new CoreRepository(coreDao);
  const getLocale = new GetLocale(coreRepository);
  const translations = await getLocale.execute(lang, version);

  if (!translations) {
    return c.json({ message: 'Locale not found' }, StatusCodes.NOT_FOUND);
  }

  return c.json(translations, StatusCodes.OK);
});

coreRouter.openapi(getSupportedLocalesRoute, async (c) => {
  const { version } = c.req.valid('param');

  const daoFactory = new DaoFactory();
  const coreDao = daoFactory.db.coreDao();
  const coreRepository = new CoreRepository(coreDao);
  const getSupportedLocalesByVersion = new GetSupportedLocalesByVersion(
    coreRepository
  );

  try {
    const languages = await getSupportedLocalesByVersion.execute(version);
    return c.json(languages, StatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: error.message
      });
    }
    throw error;
  }
});

export default coreRouter;
