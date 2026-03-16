import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  loginBodySchema,
  logoutSchema,
  refreshSchema,
  registerBodySchema,
} from './schemas/auth.requests.schema';
import {
  loginPayloadSchema,
  logoutPayloadSchema,
  mePayloadSchema,
  refreshPayloadSchema,
  registerPayloadSchema,
} from './schemas/auth.responses.schema';

export const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: registerPayloadSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: 'Log in a user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User logged in successfully',
      content: {
        'application/json': {
          schema: loginPayloadSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const refreshRoute = createRoute({
  method: 'post',
  path: '/refresh',
  tags: ['Auth'],
  summary: 'Refresh authentication token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Token refreshed successfully',
      content: {
        'application/json': {
          schema: refreshPayloadSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Auth'],
  summary: 'Log out a user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: logoutSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User logged out successfully',
      content: {
        'application/json': {
          schema: logoutPayloadSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const meRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['Auth'],
  summary: 'Get authenticated user info',
  responses: {
    200: {
      description: 'Authenticated user information retrieved successfully',
      content: {
        'application/json': {
          schema: mePayloadSchema,
        },
      },
    },
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
