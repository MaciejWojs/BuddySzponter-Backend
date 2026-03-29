import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import administrationSystemLanguagesRouter from '../languages/api/languages.routes';
import administrationSystemVersionsRouter from '../versions/api/versions.routes';
import { getAdministrationSystemRoute } from './system.openapi';

const administrationSystemRouter = new OpenAPIHono({ defaultHook });

administrationSystemRouter.use('*', isAdmin);

administrationSystemRouter.openapi(getAdministrationSystemRoute, (c) => {
  return c.json(
    {
      module: 'administration/system',
      status: 'dummy' as const,
      message: 'Dummy endpoint for administration system',
      children: ['languages', 'versions'],
    },
    StatusCodes.OK,
  );
});

administrationSystemRouter.route(
  '/languages',
  administrationSystemLanguagesRouter,
);
administrationSystemRouter.route(
  '/versions',
  administrationSystemVersionsRouter,
);

export default administrationSystemRouter;
