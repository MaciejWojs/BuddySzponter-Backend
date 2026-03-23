import { OpenAPIHono } from '@hono/zod-openapi';

import { configProvider } from '@/config/configProvider';
import { printMetrics } from '@/core/infrastucture/metrics';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import healthRouter from '../health/api/health.routes';

const systemRouter = new OpenAPIHono({ defaultHook });

systemRouter.route('/health', healthRouter);
if (configProvider.get('MONITORING_ENABLED')) {
  systemRouter.get('/metrics', printMetrics);
}
export default systemRouter;
