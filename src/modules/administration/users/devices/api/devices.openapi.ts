import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
} from '@/shared/api/openapi/error.openapi';

import { administrationDummyResponseSchema } from '../../../api/schemas/administration.response.schema';

export const getAdministrationUsersDevicesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Administration'],
  summary: 'Get administration users devices module overview (dummy)',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description:
        'Administration users devices overview returned successfully',
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
