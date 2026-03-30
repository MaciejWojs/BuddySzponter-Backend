import { createRoute } from '@hono/zod-openapi';

import { isAdmin } from '@/shared/api/middleware/isAdmin';
import {
  decryptionErrorResponse,
  internalServerErrorResponse,
  unauthorizedErrorResponse,
  unprocessableEntityResponse,
} from '@/shared/api/openapi/error.openapi';

import { administrationDummyResponseSchema } from '../../../api/schemas/administration.response.schema';
import {
  createVersionRequestSchema,
  getVersionsQuerySchema,
  patchVersionRequestSchema,
  versionIdParamSchema,
} from './schemas/versions.request.schema';
import {
  versionMutationResponseSchema,
  versionResponseSchema,
  versionsResponseSchema,
  versionsTotalResponseSchema,
} from './schemas/versions.response.schema';

export const getAdministrationSystemVersionsRoute = createRoute({
  method: 'get',
  path: '/dummy',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Get administration system versions module overview (dummy)',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description:
        'Administration system versions overview returned successfully',
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

export const getVersionsTotalRoute = createRoute({
  method: 'get',
  path: '/total',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Get total app versions count',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Versions total retrieved successfully',
      content: {
        'application/json': {
          schema: versionsTotalResponseSchema,
        },
      },
    },
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getVersionsRoute = createRoute({
  method: 'get',
  path: '/',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Get app versions (paginated with optional filters)',
  security: [{ AuthorizationBearer: [] }],
  request: {
    query: getVersionsQuerySchema,
  },
  responses: {
    200: {
      description: 'Versions retrieved successfully',
      content: {
        'application/json': {
          schema: versionsResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getVersionByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Get app version by ID',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: versionIdParamSchema,
  },
  responses: {
    200: {
      description: 'Version retrieved successfully',
      content: {
        'application/json': {
          schema: versionResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const createVersionRoute = createRoute({
  method: 'post',
  path: '/',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Create app version',
  security: [{ AuthorizationBearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createVersionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Version created successfully',
      content: {
        'application/json': {
          schema: versionMutationResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const updateVersionRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary:
    'Update app version by ID (all fields optional, at least one required)',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: versionIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: patchVersionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Version updated successfully',
      content: {
        'application/json': {
          schema: versionMutationResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteVersionRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  middleware: [isAdmin],
  tags: ['Administration/System'],
  summary: 'Delete app version by ID',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: versionIdParamSchema,
  },
  responses: {
    200: {
      description: 'Version deleted successfully',
      content: {
        'application/json': {
          schema: versionMutationResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
