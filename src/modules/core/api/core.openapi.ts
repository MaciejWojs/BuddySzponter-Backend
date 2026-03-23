import { createRoute } from '@hono/zod-openapi';

import {
  internalServerErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  coreLocaleQuerySchema,
  createAppVersionRequestSchema,
  supportedLocalesByVersionParamsSchema,
  uploadLocaleFormSchema,
} from './schemas/core.requests.schema';
import {
  coreLocaleNotFoundResponseSchema,
  coreLocalePayloadResponseSchema,
  createAppVersionResponseSchema,
  supportedLocalesResponseSchema,
  supportedVersionsResponseSchema,
  uploadLocaleResponseSchema,
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
          schema: supportedVersionsResponseSchema,
        },
      },
    },
    ...internalServerErrorResponse,
  },
});

export const getCoreLocaleRoute = createRoute({
  method: 'get',
  path: '/locale',
  tags: ['Core'],
  summary: 'Get locale translations',
  description:
    'Returns translation payload for selected language. Used by the frontend to set the application language.',
  request: {
    query: coreLocaleQuerySchema,
  },
  responses: {
    200: {
      description: 'Translation payload for requested language',
      content: {
        'application/json': {
          schema: coreLocalePayloadResponseSchema,
        },
      },
    },
    404: {
      description: 'Language not found',
      content: {
        'application/json': {
          schema: coreLocaleNotFoundResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
  },
});

export const uploadLocaleRoute = createRoute({
  method: 'post',
  path: '/upload-locale',
  tags: ['Core'],
  summary: 'Upload locale JSON file',
  description:
    'Uploads locale JSON file to MinIO, calculates SHA-256 hash and updates langHash for selected app version.',
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: uploadLocaleFormSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Locale uploaded successfully',
      content: {
        'application/json': {
          schema: uploadLocaleResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
  },
});

export const createAppVersionRoute = createRoute({
  method: 'post',
  path: '/versions',
  tags: ['Core'],
  summary: 'Create app version',
  description: 'Creates a new application version entry.',
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: createAppVersionRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'App version created',
      content: {
        'application/json': {
          schema: createAppVersionResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
  },
});

export const getSupportedLocalesRoute = createRoute({
  method: 'get',
  path: '/languages/:version',
  tags: ['Core'],
  summary: 'Get available languages by app version',
  request: {
    params: supportedLocalesByVersionParamsSchema,
  },
  responses: {
    200: {
      description: 'List of available language codes for selected version',
      content: {
        'application/json': {
          schema: supportedLocalesResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
  },
});
