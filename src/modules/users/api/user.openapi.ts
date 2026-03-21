import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  getUsersPaginatedQuerySchema,
  patchUserRequestSchema,
  postUserAvatarRequestSchema,
  userIdParamSchema,
} from './schemas/user.request.schema';
import {
  deleteUserResponseSchema,
  getUserResponseSchema,
  getUsersResponseSchema,
  patchUserResponseSchema,
  postUserAvatarResponseSchema,
} from './schemas/user.response.schema';

export const getUserByIdRoute = createRoute({
  method: 'get',
  path: '/:id',
  tags: ['User'],
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
export const getUsersPaginatedRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['User'],
  summary: 'Get users paginated',
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  request: {
    query: getUsersPaginatedQuerySchema,
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
  path: '/:id',
  tags: ['User'],
  summary: 'Update user by ID',
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  request: {
    params: userIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: patchUserRequestSchema,
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
export const postUserAvatarRequestRoute = createRoute({
  method: 'post',
  path: '/:id/avatar',
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
  path: '/:id',
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
