import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { getAdministrationSystemVersionsRoute } from './versions.openapi';

const administrationSystemVersionsRouter = new OpenAPIHono({ defaultHook });

administrationSystemVersionsRouter.use('*', isAdmin);

administrationSystemVersionsRouter.openapi(
  getAdministrationSystemVersionsRoute,
  (c) => {
    return c.json(
      {
        module: 'administration/system/versions',
        status: 'dummy' as const,
        message: 'Dummy endpoint for administration system versions',
      },
      StatusCodes.OK,
    );
  },
);

export default administrationSystemVersionsRouter;
