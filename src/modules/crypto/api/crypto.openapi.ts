import { createRoute } from '@hono/zod-openapi';

import {
  internalServerErrorResponse,
  unprocessableEntityResponse
} from '@/shared/api/openapi/error.openapi';

import { handshakeRequestSchema } from './schemas/crypto.requests.schema';
import { handshakeResponseSchema } from './schemas/crypto.responses.schema';

export const handshakeRoute = createRoute({
  method: 'post',
  path: '/handshake',
  tags: ['Crypto'],
  summary: 'Initiate a handshake to establish a secure session',
  request: {
    body: {
      content: {
        'application/json': {
          schema: handshakeRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Handshake successful',
      content: {
        'application/json': {
          schema: handshakeResponseSchema
        }
      }
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse
  }
});
