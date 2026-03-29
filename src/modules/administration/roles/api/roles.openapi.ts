import { createRoute } from '@hono/zod-openapi';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import { administrationDummyResponseSchema } from '../../api/schemas/administration.response.schema';
import {
  createRoleRequestSchema,
  patchRoleRequestSchema,
  roleIdParamSchema,
} from './schemas/roles.request.schema';
import {
  getRolesResponseSchema,
  roleMutationResponseSchema,
} from './schemas/roles.response.schema';

export const getAdministrationRolesRoute = createRoute({
  method: 'get',
  path: '/dummy',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Get administration roles module overview (dummy)',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Administration roles overview returned successfully',
      content: {
        'application/json': {
          schema: administrationDummyResponseSchema,
        },
      },
    },
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getRolesRoute = createRoute({
  method: 'get',
  path: '/',
  middleware: [isAdmin],
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
  middleware: [isAdmin],
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
  middleware: [isAdmin],
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
  middleware: [isAdmin],
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
