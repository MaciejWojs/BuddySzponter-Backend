import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { DaoFactory } from '@/infrastucture/factories/daoFactory';
import { GetLocale } from '@/modules/core/application/use-cases/getLocale';
import { GetSupportedLocalesByVersion } from '@/modules/core/application/use-cases/getSupportedLocalesByVersion';
import { CoreRepository } from '@/modules/core/infrastructure/repositories/CoreRepository';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { DeleteLocale } from '../application/use-case/deleteLocale';
import { DeleteLocalesByVersion } from '../application/use-case/deleteLocalesByVersion';
import { UploadLocale } from '../application/use-case/uploadLocale';
import {
  deleteLocaleRoute,
  deleteLocalesByVersionRoute,
  getLocaleRoute,
  getSupportedLocalesRoute,
  uploadLocaleRoute,
} from './languages.openapi';

const administrationSystemLanguagesRouter = new OpenAPIHono<ENV>({
  defaultHook,
});

administrationSystemLanguagesRouter.openapi(getLocaleRoute, async (c) => {
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

administrationSystemLanguagesRouter.openapi(uploadLocaleRoute, async (c) => {
  const form = c.req.valid('form');
  const maxBytes = 10 * 1024 * 1024;

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

  try {
    const result = await uploadLocale.execute({ buffer, lang, version });

    return c.json(
      {
        message: result.fileUrl,
        hash: result.hash,
        lang: result.lang,
        version: result.version,
      },
      StatusCodes.OK,
    );
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
});

administrationSystemLanguagesRouter.openapi(
  getSupportedLocalesRoute,
  async (c) => {
    const { version } = c.req.valid('param');

    const daoFactory = new DaoFactory();
    const coreDao = daoFactory.db.coreDao();
    const coreRepository = new CoreRepository(coreDao);
    const getSupportedLocalesByVersion = new GetSupportedLocalesByVersion(
      coreRepository,
    );

    try {
      const languages = await getSupportedLocalesByVersion.execute(version);
      return c.json(languages, StatusCodes.OK);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HTTPException(StatusCodes.NOT_FOUND, {
          message: error.message,
        });
      }
      throw error;
    }
  },
);

administrationSystemLanguagesRouter.openapi(deleteLocaleRoute, async (c) => {
  const { version, lang } = c.req.valid('param');

  const daoFactory = new DaoFactory();
  const coreDao = daoFactory.db.coreDao();
  const coreRepository = new CoreRepository(coreDao);
  const deleteLocale = new DeleteLocale(coreRepository);

  try {
    await deleteLocale.execute(version, lang);
    return c.json(
      { message: `Locale '${lang}' deleted for version ${version}` },
      StatusCodes.OK,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'lang', error: error.message }],
      });
    }
    throw error;
  }
});

administrationSystemLanguagesRouter.openapi(
  deleteLocalesByVersionRoute,
  async (c) => {
    const { version } = c.req.valid('param');

    const daoFactory = new DaoFactory();
    const coreDao = daoFactory.db.coreDao();
    const coreRepository = new CoreRepository(coreDao);
    const deleteLocalesByVersion = new DeleteLocalesByVersion(coreRepository);

    try {
      const deletedCount = await deleteLocalesByVersion.execute(version);
      return c.json(
        {
          message: `Deleted ${deletedCount} locale file(s) for version ${version}`,
        },
        StatusCodes.OK,
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HTTPException(StatusCodes.NOT_FOUND, {
          message: 'NotFoundError',
          cause: [{ field: 'version', error: error.message }],
        });
      }
      throw error;
    }
  },
);

export default administrationSystemLanguagesRouter;
