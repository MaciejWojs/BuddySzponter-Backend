import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { CreateAppVersion } from '../application/use-cases/createAppVersion';
import { GetLocale } from '../application/use-cases/getLocale';
import { GetSupportedVersions } from '../application/use-cases/getSupportedVersions';
import { UploadLocale } from '../application/use-cases/uploadLocale';
import { CoreRepository } from '../infrastructure/repositories/CoreRepository';
import {
  createAppVersionRoute,
  getCoreLocaleRoute,
  getSupportedVersionsRoute,
  uploadLocaleRoute,
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

coreRouter.openapi(createAppVersionRoute, async (c) => {
  const data = c.req.valid('form');

  const daoFactory = new DaoFactory();
  const coreDao = daoFactory.db.coreDao();
  const coreRepository = new CoreRepository(coreDao);
  const createAppVersion = new CreateAppVersion(coreRepository);

  try {
    const created = await createAppVersion.execute(data);
    return c.json(created, StatusCodes.CREATED);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: error.message,
      });
    }
    throw error;
  }
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

coreRouter.openapi(uploadLocaleRoute, async (c) => {
  const form = c.req.valid('form');
  const maxBytes = 10 * 1024 * 1024; // 10MB

  const localeFile = form.file;
  const lang = form.lang;
  const version = form.version;

  if (!(localeFile instanceof File)) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'No locale file provided',
    });
  }

  if (localeFile.size > maxBytes) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'Max locale file size is 10MB',
    });
  }

  const fileName = localeFile.name.toLowerCase();
  const isJsonMime =
    localeFile.type === 'application/json' || localeFile.type === 'text/json';
  const isJsonExt = fileName.endsWith('.json');

  if (!isJsonMime && !isJsonExt) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'Locale file must be a JSON file',
    });
  }

  const arrayBuffer = await localeFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    JSON.parse(buffer.toString('utf-8'));
  } catch {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'Invalid JSON content',
    });
  }

  const daoFactory = new DaoFactory();
  const coreDao = daoFactory.db.coreDao();
  const coreRepository = new CoreRepository(coreDao);
  const uploadLocale = new UploadLocale(coreRepository);

  let result;
  try {
    result = await uploadLocale.execute({ buffer, lang, version });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Invalid version format') ||
        error.message.includes('Invalid language code'))
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: error.message,
      });
    }
    if (error instanceof Error && error.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: error.message,
      });
    }
    throw error;
  }

  return c.json(
    {
      message: result.fileUrl,
      hash: result.hash,
      lang: result.lang,
      version: result.version,
    },
    StatusCodes.OK,
  );
});

export default coreRouter;
