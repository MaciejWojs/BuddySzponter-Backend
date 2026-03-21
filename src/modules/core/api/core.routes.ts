import { OpenAPIHono } from '@hono/zod-openapi';
import { type SupportedLocale,supportedLocales } from '@shared/locales';
import { StatusCodes } from 'http-status-codes';

import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { GetLocale } from '../application/use-cases/getLocale';
import { GetSupportedVersions } from '../application/use-cases/getSupportedVersions';
import { CoreRepository } from '../infrastructure/repositories/CoreRepository';
import {
  getCoreLocaleRoute,
  getSupportedLocalesRoute,
  getSupportedVersionsRoute,
} from './core.openapi';

const coreRouter = new OpenAPIHono({ defaultHook });

coreRouter.openapi(getSupportedVersionsRoute, async (c) => {
  const daoFactory = new DaoFactory();
  const coreDao = daoFactory.db.coreDao();
  const coreRepository = new CoreRepository(coreDao);
  const getSupportedVersions = new GetSupportedVersions(coreRepository);

  const versions = await getSupportedVersions.execute();

  return c.json(versions, StatusCodes.OK);
});

coreRouter.openapi(getCoreLocaleRoute, (c) => {
  const { lang } = c.req.valid('query');
  const getLocale = new GetLocale();
  const translations = getLocale.execute(lang as SupportedLocale);

  if (!translations) {
    return c.json({ message: 'Locale not found' }, StatusCodes.NOT_FOUND);
  }

  return c.json(translations, StatusCodes.OK);
});

coreRouter.openapi(getSupportedLocalesRoute, (c) => {
  return c.json([...supportedLocales], StatusCodes.OK);
});

export default coreRouter;
