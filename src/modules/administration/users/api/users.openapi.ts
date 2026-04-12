import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  getUsersQuerySchema,
  patchAdminUserSchema,
  postUserAvatarRequestSchema,
  userIdDeviceIdParamSchema,
  userIdParamSchema,
} from './schemas/user.request.schema';
import {
  deleteUserResponseSchema,
  getUserDevicesResponseSchema,
  getUserResponseSchema,
  getUserSessionsResponseSchema,
  getUsersResponseSchema,
  patchUserResponseSchema,
  postUserAvatarResponseSchema,
} from './schemas/user.response.schema';

export const getUserByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Administration/Users'],
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

export const getUserDevicesRoute = createRoute({
  method: 'get',
  path: '/{id}/devices',
  tags: ['Administration/Users'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Get user devices by user ID',
  request: {
    params: userIdParamSchema,
  },
  responses: {
    200: {
      description: 'User devices retrieved successfully',
      content: {
        'application/json': {
          schema: getUserDevicesResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getUserSessionsRoute = createRoute({
  method: 'get',
  path: '/{id}/sessions',
  tags: ['Administration/Users'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Get user sessions by user ID',
  request: {
    params: userIdParamSchema,
  },
  responses: {
    200: {
      description: 'User sessions retrieved successfully',
      content: {
        'application/json': {
          schema: getUserSessionsResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteUserDevicesRoute = createRoute({
  method: 'delete',
  path: '/{id}/devices',
  tags: ['Administration/Users'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Delete all devices for user by user ID',
  request: {
    params: userIdParamSchema,
  },
  responses: {
    200: {
      description: 'User devices deleted successfully',
      content: {
        'application/json': {
          schema: deleteUserResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteUserDeviceRoute = createRoute({
  method: 'delete',
  path: '/{id}/devices/{deviceId}',
  tags: ['Administration/Users'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Delete user device by user ID and device ID',
  request: {
    params: userIdDeviceIdParamSchema,
  },
  responses: {
    200: {
      description: 'User device deleted successfully',
      content: {
        'application/json': {
          schema: deleteUserResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getUsersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Administration/Users'],
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
  tags: ['Administration/Users'],
  summary: 'Update user by ID (admin)',
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
          schema: patchAdminUserSchema,
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
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Administration/Users'],
  summary: 'Delete user by ID (admin)',
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
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
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const postUserAvatarRequestRoute = createRoute({
  method: 'post',
  path: '/{id}/avatar',
  tags: ['Administration/Users'],
  security: [
    {
      AuthorizationBearer: [],
    },
  ],
  summary: 'Upload user avatar by ID (admin)',
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
      description: 'User avatar uploaded successfully',
      content: {
        'application/json': {
          schema: postUserAvatarResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
