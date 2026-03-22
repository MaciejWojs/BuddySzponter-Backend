import { OpenAPIHono } from '@hono/zod-openapi';

import { printMetrics } from '@/core/infrastucture/metrics';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import healthRouter from '../health/api/health.routes';

const systemRouter = new OpenAPIHono({ defaultHook });

systemRouter.route('/health', healthRouter);
systemRouter.get('/metrics', printMetrics);

export default systemRouter;
