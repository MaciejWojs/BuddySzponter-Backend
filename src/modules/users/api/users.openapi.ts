import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  patchSelfUserSchema,
  postUserAvatarRequestSchema,
} from './schemas/users.request.schema';
import {
  deleteUserResponseSchema,
  patchUserResponseSchema,
  postUserAvatarResponseSchema,
} from './schemas/users.response.schema';

export const updateSelfUserRoute = createRoute({
  method: 'patch',
  path: '/me',
  tags: ['User'],
  summary: 'Update authenticated user profile',
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  request: {
    body: {
      content: {
        'application/json': {
          schema: patchSelfUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: patchUserResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const postSelfUserAvatarRequestRoute = createRoute({
  method: 'post',
  path: '/me/avatar',
  tags: ['User'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Upload authenticated user avatar',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: postUserAvatarRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User avatar request posted successfully',
      content: {
        'application/json': {
          schema: postUserAvatarResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteSelfUserRoute = createRoute({
  method: 'delete',
  path: '/me',
  tags: ['User'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Delete authenticated user',
  responses: {
    200: {
      description: 'User deleted successfully',
      content: {
        'application/json': {
          schema: deleteUserResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
