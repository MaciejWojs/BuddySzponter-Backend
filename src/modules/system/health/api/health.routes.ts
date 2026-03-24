import { OpenAPIHono } from '@hono/zod-openapi';
import { sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';

import { APP_CONFIG } from '@/config/appConfig';
import { client as redisClient } from '@/infrastucture/cache/client';
import { db } from '@/infrastucture/db/client';
import { localesClient } from '@/infrastucture/s3/client';
import { defaultHook } from '@/shared/api/openapi/defaultHook';

import { deepHealthRoute, healthRoute } from './health.openapi';

const healthRouter = new OpenAPIHono({ defaultHook });

const checkDependency = async (fn: () => Promise<unknown>) => {
  const start = performance.now();
  try {
    await fn();
    return {
      status: 'OK' as const,
      responseTimeMs: Math.max(1, Math.round(performance.now() - start)),
    };
  } catch {
    return {
      status: 'ERROR' as const,
      responseTimeMs: Math.max(1, Math.round(performance.now() - start)),
    };
  }
};

healthRouter.openapi(healthRoute, async (c) => {
  return c.json(
    {
      service: APP_CONFIG.basic.appName,
      version: APP_CONFIG.basic.version,
      timestamp: new Date(),
    },
    StatusCodes.OK,
  );
});

healthRouter.openapi(deepHealthRoute, async (c) => {
  const [database, cache, minio] = await Promise.all([
    checkDependency(async () => {
      await db.execute(sql`
        SELECT
          1
      `);
    }),
    checkDependency(async () => {
      if (!redisClient.connected) {
        await redisClient.connect();
      }
      await redisClient.ping();
    }),
    checkDependency(async () => {
      await localesClient.file('__healthcheck__/ping.txt').exists();
    }),
  ]);

  const isHealthy =
    database.status === 'OK' && cache.status === 'OK' && minio.status === 'OK';

  if (!isHealthy) {
    return c.json(
      { message: 'Service Unavailable' },
      StatusCodes.SERVICE_UNAVAILABLE,
    );
  }

  return c.json(
    {
      service: APP_CONFIG.basic.appName,
      version: APP_CONFIG.basic.version,
      timestamp: new Date(),
      database,
      cache,
      minio,
    },
    StatusCodes.OK,
  );
});

export default healthRouter;
