import { OpenAPIHono } from '@hono/zod-openapi';

import { defaultHook } from '@/shared/api/openapi/defaultHook';

import healthRouter from '../health/api/health.routes';

const systemRouter = new OpenAPIHono({ defaultHook });

systemRouter.route('/health', healthRouter);

export default systemRouter;
