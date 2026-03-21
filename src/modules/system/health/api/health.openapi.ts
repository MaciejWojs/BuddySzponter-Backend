import { createRoute } from '@hono/zod-openapi';

import {
  internalServerErrorResponse,
  serviceUnavailableErrorResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  deepHealthResponseSchema,
  healthPayloadResponseSchema,
} from './schemas/health.responses.schema';

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

export const deepHealthRoute = createRoute({
  method: 'get',
  path: '/deep',
  tags: ['System Health'],
  summary: 'Deep health check endpoint',
  description: 'Returns detailed health status for each service.',
  responses: {
    200: {
      description: 'Service is healthy',
      content: {
        'application/json': {
          schema: deepHealthResponseSchema,
        },
      },
    },
    ...internalServerErrorResponse,
    ...serviceUnavailableErrorResponse,
  },
});
