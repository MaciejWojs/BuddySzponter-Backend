import { createRoute } from '@hono/zod-openapi';

import {
  internalServerErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import { getLocaleQuerySchema } from './schemas/i18n.requests.schema';
import {
  localeNotFoundSchema,
  localePayloadSchema,
} from './schemas/i18n.responses.schema';

export const getLocaleRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['I18n'],
  summary: 'Get locale translations',
  description:
    'Returns translation payload for selected language. Used by the frontend to set the application language.',
  request: {
    query: getLocaleQuerySchema,
  },
  responses: {
    200: {
      description: 'Translation payload for requested language',
      content: {
        'application/json': {
          schema: localePayloadSchema,
        },
      },
    },
    404: {
      description: 'Language not found',
      content: {
        'application/json': {
          schema: localeNotFoundSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
  },
});
