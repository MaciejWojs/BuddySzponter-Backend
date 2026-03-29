import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { getAdministrationUsersSessionsRoute } from './sessions.openapi';

const administrationUsersSessionsRouter = new OpenAPIHono({ defaultHook });

administrationUsersSessionsRouter.use('*', isAdmin);

administrationUsersSessionsRouter.openapi(
  getAdministrationUsersSessionsRoute,
  (c) => {
    return c.json(
      {
        module: 'administration/users/sessions',
        status: 'dummy' as const,
        message: 'Dummy endpoint for administration users sessions',
      },
      StatusCodes.OK,
    );
  },
);

export default administrationUsersSessionsRouter;
