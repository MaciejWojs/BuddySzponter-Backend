import { createRoute } from '@hono/zod-openapi';

import { internalServerErrorResponse } from '@/shared/api/openapi/error.openapi';

import { supportedVersionsResponseSchema } from './schemas/core.responses.schema';

export const getSupportedVersionsRoute = createRoute({
  method: 'get',
  path: '/supported-versions',
  tags: ['Core'],
  summary: 'Get supported app versions',
  description: 'Returns app versions that are currently supported.',
  responses: {
    200: {
      description: 'List of supported versions',
      content: {
        'application/json': {
          schema: supportedVersionsResponseSchema,
        },
      },
    },
    ...internalServerErrorResponse,
  },
});
