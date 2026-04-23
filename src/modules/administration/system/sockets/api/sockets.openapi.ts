import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
  unprocessableEntityResponse
} from '@/shared/api/openapi/error.openapi';

import {
  connectionIdParamSchema,
  connectionSocketParamsSchema
} from './schemas/sockets.request.schema';
import {
  activeSocketConnectionsResponseSchema,
  kickSocketResponseSchema,
  terminateSocketConnectionResponseSchema
} from './schemas/sockets.response.schema';

export const getActiveSocketConnectionsRoute = createRoute({
  method: 'get',
  path: '/connections',
  tags: ['Administration/System'],
  summary: 'List active socket connections',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Active socket connections retrieved successfully',
      content: {
        'application/json': {
          schema: activeSocketConnectionsResponseSchema
        }
      }
    },
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse
  }
});

export const terminateSocketConnectionRoute = createRoute({
  method: 'delete',
  path: '/connections/{connectionId}',
  tags: ['Administration/System'],
  summary: 'Terminate socket connection (disconnect all sockets in connection)',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: connectionIdParamSchema
  },
  responses: {
    200: {
      description: 'Socket connection terminated successfully',
      content: {
        'application/json': {
          schema: terminateSocketConnectionResponseSchema
        }
      }
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse
  }
});

export const kickSocketFromConnectionRoute = createRoute({
  method: 'delete',
  path: '/connections/{connectionId}/sockets/{socketId}',
  tags: ['Administration/System'],
  summary: 'Kick a single socket from an active connection',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: connectionSocketParamsSchema
  },
  responses: {
    200: {
      description: 'Socket kicked successfully',
      content: {
        'application/json': {
          schema: kickSocketResponseSchema
        }
      }
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse
  }
});
