import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { getAdministrationUsersDevicesRoute } from './devices.openapi';

const administrationUsersDevicesRouter = new OpenAPIHono({ defaultHook });

administrationUsersDevicesRouter.use('*', isAdmin);

administrationUsersDevicesRouter.openapi(
  getAdministrationUsersDevicesRoute,
  (c) => {
    return c.json(
      {
        module: 'administration/users/devices',
        status: 'dummy' as const,
        message: 'Dummy endpoint for administration users devices',
      },
      StatusCodes.OK,
    );
  },
);

export default administrationUsersDevicesRouter;
