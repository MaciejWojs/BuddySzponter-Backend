import { createRoute } from '@hono/zod-openapi';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  getUsersQuerySchema,
  getUsersTotalQuerySchema,
  patchSelfQuerySchema,
  patchUserQuerySchema,
  postUserAvatarRequestSchema,
  userIdParamSchema,
} from './schemas/user.request.schema';
import {
  deleteUserResponseSchema,
  getUserResponseSchema,
  getUsersResponseSchema,
  getUsersTotalResponseSchema,
  patchUserResponseSchema,
  postUserAvatarResponseSchema,
} from './schemas/user.response.schema';

export const getUserByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  middleware: [isAdmin],
  tags: ['User'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Get user by ID',
  request: {
    params: userIdParamSchema,
  },
  responses: {
    200: {
      description: 'User retrieved successfully',
      content: {
        'application/json': {
          schema: getUserResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getUsersTotalRoute = createRoute({
  method: 'get',
  path: '/total',
  middleware: [isAdmin],
  tags: ['User'],
  summary: 'Get users total',
  security: [{ AuthorizationBearer: [] }],
  request: {
    query: getUsersTotalQuerySchema,
  },
  responses: {
    200: {
      description: 'Users total retrieved successfully',
      content: {
        'application/json': {
          schema: getUsersTotalResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getUsersRoute = createRoute({
  method: 'get',
  path: '/',
  middleware: [isAdmin],
  tags: ['User'],
  summary: 'Get users',
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  request: {
    query: getUsersQuerySchema,
  },
  responses: {
    200: {
      description: 'Users retrieved successfully',
      content: {
        'application/json': {
          schema: getUsersResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const updateUserRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  middleware: [isAdmin],
  tags: ['User'],
  summary: 'Update user by ID',
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  request: {
    params: userIdParamSchema,
    query: patchUserQuerySchema,
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

export const updateSelfRoute = createRoute({
  method: 'patch',
  path: '/me',
  tags: ['User'],
  summary: 'Update current user profile',
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  request: {
    query: patchSelfQuerySchema,
  },
  responses: {
    200: {
      description: 'Profile updated successfully',
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

export const postUserAvatarRequestRoute = createRoute({
  method: 'post',
  path: '/{id}/avatar',
  tags: ['User'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Post user avatar request',
  request: {
    params: userIdParamSchema,
    body: {
      content: {
        'image/png': {
          schema: postUserAvatarRequestSchema,
        },
        'image/jpeg': {
          schema: postUserAvatarRequestSchema,
        },
        'image/webp': {
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
export const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  middleware: [isAdmin],
  tags: ['User'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Delete user by ID',
  request: {
    params: userIdParamSchema,
  },
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
