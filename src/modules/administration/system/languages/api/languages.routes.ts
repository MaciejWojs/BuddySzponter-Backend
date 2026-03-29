import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { getAdministrationSystemLanguagesRoute } from './languages.openapi';

const administrationSystemLanguagesRouter = new OpenAPIHono({ defaultHook });

administrationSystemLanguagesRouter.use('*', isAdmin);

administrationSystemLanguagesRouter.openapi(
  getAdministrationSystemLanguagesRoute,
  (c) => {
    return c.json(
      {
        module: 'administration/system/languages',
        status: 'dummy' as const,
        message: 'Dummy endpoint for administration system languages',
      },
      StatusCodes.OK,
    );
  },
);

export default administrationSystemLanguagesRouter;
