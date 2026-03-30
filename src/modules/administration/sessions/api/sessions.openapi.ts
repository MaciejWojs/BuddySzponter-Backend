import { createRoute } from '@hono/zod-openapi';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import { administrationDummyResponseSchema } from '../../api/schemas/administration.response.schema';
import {
  getSessionsQuerySchema,
  sessionIdParamSchema,
} from './schemas/sessions.request.schema';
import {
  sessionsResponseSchema,
  terminateSessionResponseSchema,
} from './schemas/sessions.response.schema';

export const getAdministrationSessionsRoute = createRoute({
  method: 'get',
  path: '/dummy',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Get administration sessions module overview (dummy)',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Administration sessions overview returned successfully',
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

export const getSessionsRoute = createRoute({
  method: 'get',
  path: '/',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Get sessions',
  security: [{ AuthorizationBearer: [] }],
  request: {
    query: getSessionsQuerySchema,
  },
  responses: {
    200: {
      description: 'Sessions retrieved successfully',
      content: {
        'application/json': {
          schema: sessionsResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const terminateSessionRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Terminate session (logout user session)',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: sessionIdParamSchema,
  },
  responses: {
    200: {
      description: 'Session terminated successfully',
      content: {
        'application/json': {
          schema: terminateSessionResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
