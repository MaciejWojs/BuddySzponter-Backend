import { OpenAPIHono } from '@hono/zod-openapi';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import administrationDevicesRouter from '../devices/api/devices.routes';
import administrationRolesRouter from '../roles/api/roles.routes';
import administrationSessionsRouter from '../sessions/api/sessions.routes';
import administrationSystemRouter from '../system/api/system.routes';
import administrationUsersRouter from '../users/api/users.routes';

const administrationRouter = new OpenAPIHono({ defaultHook });

administrationRouter.use('*', isAdmin);

administrationRouter.route('/users', administrationUsersRouter);
administrationRouter.route('/roles', administrationRolesRouter);
administrationRouter.route('/devices', administrationDevicesRouter);
administrationRouter.route('/sessions', administrationSessionsRouter);
administrationRouter.route('/system', administrationSystemRouter);

export default administrationRouter;
