import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
} from '@/shared/api/openapi/error.openapi';

import { administrationDummyResponseSchema } from '../../../api/schemas/administration.response.schema';

export const getAdministrationUsersConnectionsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Administration'],
  summary: 'Get administration users connections module overview (dummy)',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description:
        'Administration users connections overview returned successfully',
      content: {
        'application/json': {
          schema: administrationDummyResponseSchema,
        },
      },
    },
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
