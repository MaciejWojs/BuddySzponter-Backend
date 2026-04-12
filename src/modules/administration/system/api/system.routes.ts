import { OpenAPIHono } from '@hono/zod-openapi';

import { defaultHook } from '@/shared/api/openapi/defaultHook';

import administrationSystemLanguagesRouter from '../languages/api/languages.routes';
import administrationSystemVersionsRouter from '../versions/api/versions.routes';

const administrationSystemRouter = new OpenAPIHono({ defaultHook });

administrationSystemRouter.route(
  '/languages',
  administrationSystemLanguagesRouter,
);
administrationSystemRouter.route(
  '/versions',
  administrationSystemVersionsRouter,
);

export default administrationSystemRouter;
