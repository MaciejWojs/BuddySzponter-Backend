import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import administrationDevicesRouter from '../devices/api/devices.routes';
import administrationRolesRouter from '../roles/api/roles.routes';
import administrationSystemRouter from '../system/api/system.routes';
import administrationUsersRouter from '../users/api/users.routes';
import { getAdministrationRoute } from './administration.openapi';

const administrationRouter = new OpenAPIHono({ defaultHook });

administrationRouter.use('*', isAdmin);

administrationRouter.openapi(getAdministrationRoute, (c) => {
  return c.json(
    {
      module: 'administration',
      status: 'dummy' as const,
      message: 'Administration module is in dummy mode',
      children: ['users', 'roles', 'devices', 'system'],
    },
    StatusCodes.OK,
  );
});

administrationRouter.route('/users', administrationUsersRouter);
administrationRouter.route('/roles', administrationRolesRouter);
administrationRouter.route('/devices', administrationDevicesRouter);
administrationRouter.route('/system', administrationSystemRouter);

export default administrationRouter;
