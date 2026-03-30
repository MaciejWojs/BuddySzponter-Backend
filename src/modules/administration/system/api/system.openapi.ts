import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
} from '@/shared/api/openapi/error.openapi';

import { administrationDummyWithChildrenResponseSchema } from '../../api/schemas/administration.response.schema';

export const getAdministrationSystemRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Administration/System'],
  summary: 'Get administration system module overview (dummy)',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Administration system overview returned successfully',
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
