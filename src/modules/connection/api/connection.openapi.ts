import { createRoute } from '@hono/zod-openapi';

import {
  internalServerErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  connectionCreateResponseSuccessSchema,
  connectionJoinResponseSuccessSchema,
} from './schemas/conection.response.schema';
import {
  createConnectionSchema,
  joinConnectionSchema,
} from './schemas/connection.request.schema';

export const ConnectionCreateRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Connection'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createConnectionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Connection created successfully',
      content: {
        'application/json': {
          schema: connectionCreateResponseSuccessSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
  },
});
export const ConnectionJoinRoute = createRoute({
  method: 'post',
  path: '/join',
  tags: ['Connection'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: joinConnectionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Connection joined successfully',
      content: {
        'application/json': {
          schema: connectionJoinResponseSuccessSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
  },
});
