import { createRoute } from '@hono/zod-openapi';

import { internalServerErrorResponse } from '@/shared/api/openapi/error.openapi';

import { healthPayloadResponseSchema } from './schemas/health.responses.schema';

export const healthRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['System Health'],
  summary: 'Health check endpoint',
  description: 'Returns current API health status and server timestamp.',
  responses: {
    200: {
      description: 'Service is healthy',
      content: {
        'application/json': {
          schema: healthPayloadResponseSchema,
        },
      },
    },
    ...internalServerErrorResponse,
  },
});
