import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
} from '@/shared/api/openapi/error.openapi';

import { administrationDummyWithChildrenResponseSchema } from './schemas/administration.response.schema';

export const getAdministrationRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Administration'],
  summary: 'Get administration module overview (dummy)',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Administration overview returned successfully',
      content: {
        'application/json': {
          schema: administrationDummyWithChildrenResponseSchema,
        },
      },
    },
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
