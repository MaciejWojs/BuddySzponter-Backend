import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { getAdministrationUsersConnectionsRoute } from './connections.openapi';

const administrationUsersConnectionsRouter = new OpenAPIHono({ defaultHook });

administrationUsersConnectionsRouter.use('*', isAdmin);

administrationUsersConnectionsRouter.openapi(
  getAdministrationUsersConnectionsRoute,
  (c) => {
    return c.json(
      {
        module: 'administration/users/connections',
        status: 'dummy' as const,
        message: 'Dummy endpoint for administration users connections',
      },
      StatusCodes.OK,
    );
  },
);

export default administrationUsersConnectionsRouter;
