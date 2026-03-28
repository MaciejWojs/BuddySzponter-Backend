import { createRoute } from '@hono/zod-openapi';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import { isAdminOrSelf } from '@/shared/api/middleware/isAdminOrSelf';
import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  getUsersQuerySchema,
  getUsersTotalQuerySchema,
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
  middleware: [isAdminOrSelf],
  tags: ['User'],
  summary: 'Update user by ID (admin or self)',
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
          schema: patchUserQuerySchema,
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
  path: '/{id}/avatar',
  middleware: [isAdminOrSelf],
  tags: ['User'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Post user avatar request (admin or self)',
  request: {
    params: userIdParamSchema,
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
