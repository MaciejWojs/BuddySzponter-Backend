import { createRoute } from '@hono/zod-openapi';

import {
  coreLocaleQuerySchema,
  supportedLocalesByVersionParamsSchema,
  uploadLocaleFormSchema,
} from '@/modules/core/api/schemas/core.requests.schema';
import {
  coreLocaleNotFoundResponseSchema,
  coreLocalePayloadResponseSchema,
  supportedLocalesResponseSchema,
  uploadLocaleResponseSchema,
} from '@/modules/core/api/schemas/core.responses.schema';
import { isAdmin } from '@/shared/api/middleware/isAdmin';
import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  versionLangParamsSchema,
  versionParamsSchema,
} from './schemas/languages.request.schema';
import { languageDeleteResponseSchema } from './schemas/languages.response.schema';

export const getLocaleRoute = createRoute({
  method: 'get',
  path: '/locale',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Get locale translations payload',
  request: {
    query: coreLocaleQuerySchema,
  },
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Locale payload returned successfully',
      content: {
        'application/json': {
          schema: coreLocalePayloadResponseSchema,
        },
      },
    },
    404: {
      description: 'Locale not found',
      content: {
        'application/json': {
          schema: coreLocaleNotFoundResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const uploadLocaleRoute = createRoute({
  method: 'post',
  path: '/upload-locale',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Upload locale JSON file',
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
  security: [{ AuthorizationBearer: [] }],
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
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getSupportedLocalesRoute = createRoute({
  method: 'get',
  path: '/{version}',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Get available languages for selected app version',
  request: {
    params: supportedLocalesByVersionParamsSchema,
  },
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Available language codes returned successfully',
      content: {
        'application/json': {
          schema: supportedLocalesResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteLocaleRoute = createRoute({
  method: 'delete',
  path: '/{version}/{lang}',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Delete locale file for selected version and language',
  request: {
    params: versionLangParamsSchema,
  },
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Locale deleted successfully',
      content: {
        'application/json': {
          schema: languageDeleteResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteLocalesByVersionRoute = createRoute({
  method: 'delete',
  path: '/{version}',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Delete all locale files for selected version',
  request: {
    params: versionParamsSchema,
  },
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Locales deleted successfully',
      content: {
        'application/json': {
          schema: languageDeleteResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
