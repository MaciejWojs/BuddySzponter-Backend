import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from 'http-status-codes';

import { APP_CONFIG } from '@/config/appConfig';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { healthRoute } from './health.openapi';

const healthRouter = new OpenAPIHono({ defaultHook });

healthRouter.openapi(healthRoute, (c) => {
  return c.json(
    {
      service: APP_CONFIG.basic.appName,
      version: APP_CONFIG.basic.version,
      timestamp: new Date(),
    },
    StatusCodes.OK,
  );
});

export default healthRouter;
