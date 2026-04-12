import { createRoute } from '@hono/zod-openapi';

import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import {
  createRoleRequestSchema,
  patchRoleRequestSchema,
  roleIdParamSchema,
} from './schemas/roles.request.schema';
import {
  getRolesResponseSchema,
  roleMutationResponseSchema,
} from './schemas/roles.response.schema';

export const getRolesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Administration'],
  summary: 'Get available roles',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Roles retrieved successfully',
      content: {
        'application/json': {
          schema: getRolesResponseSchema,
        },
      },
    },
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const createRoleRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Administration'],
  summary: 'Create role',
  security: [{ AuthorizationBearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createRoleRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Role created successfully',
      content: {
        'application/json': {
          schema: roleMutationResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const updateRoleRoute = createRoute({
  method: 'patch',
  path: '/{roleID}',
  tags: ['Administration'],
  summary: 'Update role',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: roleIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: patchRoleRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Role updated successfully',
      content: {
        'application/json': {
          schema: roleMutationResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteRoleRoute = createRoute({
  method: 'delete',
  path: '/{roleID}',
  tags: ['Administration'],
  summary: 'Delete role',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: roleIdParamSchema,
  },
  responses: {
    200: {
      description: 'Role deleted successfully',
      content: {
        'application/json': {
          schema: roleMutationResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
