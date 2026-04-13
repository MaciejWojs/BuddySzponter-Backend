import { createRoute } from '@hono/zod-openapi';

import {
  internalServerErrorResponse,
  unprocessableEntityResponse
} from '@/shared/api/openapi/error.openapi';

import {
  coreLocaleQuerySchema,
  supportedLocalesByVersionParamsSchema
} from './schemas/core.requests.schema';
import {
  coreLocaleNotFoundResponseSchema,
  coreLocalePayloadResponseSchema,
  supportedLocalesResponseSchema,
  supportedVersionsResponseSchema
} from './schemas/core.responses.schema';

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
          schema: supportedVersionsResponseSchema
        }
      }
    },
    ...internalServerErrorResponse
  }
});

export const getCoreLocaleRoute = createRoute({
  method: 'get',
  path: '/locale',
  tags: ['Core'],
  summary: 'Get locale translations',
  description:
    'Returns translation payload for selected language. Used by the frontend to set the application language.',
  request: {
    query: coreLocaleQuerySchema
  },
  responses: {
    200: {
      description: 'Translation payload for requested language',
      content: {
        'application/json': {
          schema: coreLocalePayloadResponseSchema
        }
      }
    },
    404: {
      description: 'Language not found',
      content: {
        'application/json': {
          schema: coreLocaleNotFoundResponseSchema
        }
      }
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse
  }
});

export const getSupportedLocalesRoute = createRoute({
  method: 'get',
  path: '/languages/{version}',
  tags: ['Core'],
  summary: 'Get available languages by app version',
  request: {
    params: supportedLocalesByVersionParamsSchema
  },
  responses: {
    200: {
      description: 'List of available language codes for selected version',
      content: {
        'application/json': {
          schema: supportedLocalesResponseSchema
        }
      }
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse
  }
});
