import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultHook } from '@shared/api/openapi/defaultHook';
import { locales } from '@shared/locales';
import { StatusCodes } from 'http-status-codes';

import { getLocaleRoute } from './i18n.openapi';

const i18nRouter = new OpenAPIHono({ defaultHook });

i18nRouter.openapi(getLocaleRoute, (c) => {
  const { lang } = c.req.valid('query');

  const translations = locales[lang];

  if (!translations) {
    return c.json({ message: 'Locale not found' }, StatusCodes.NOT_FOUND);
  }

  return c.json(translations, StatusCodes.OK);
});

export default i18nRouter;
