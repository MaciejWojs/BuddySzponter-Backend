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
  deviceIdParamSchema,
  getDevicesQuerySchema,
  patchDeviceRequestSchema,
} from './schemas/devices.request.schema';
import {
  deviceMutationResponseSchema,
  deviceResponseSchema,
  devicesResponseSchema,
} from './schemas/devices.response.schema';

export const getAdministrationDevicesRoute = createRoute({
  method: 'get',
  path: '/dummy',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Get administration devices module overview (dummy)',
  security: [{ AuthorizationBearer: [] }],
  responses: {
    200: {
      description: 'Administration devices overview returned successfully',
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

export const getDevicesRoute = createRoute({
  method: 'get',
  path: '/',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Get all devices',
  security: [{ AuthorizationBearer: [] }],
  request: {
    query: getDevicesQuerySchema,
  },
  responses: {
    200: {
      description: 'Devices retrieved successfully',
      content: {
        'application/json': {
          schema: devicesResponseSchema,
        },
      },
    },
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const getDeviceByIdRoute = createRoute({
  method: 'get',
  path: '/{deviceID}',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Get device by ID',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: deviceIdParamSchema,
  },
  responses: {
    200: {
      description: 'Device retrieved successfully',
      content: {
        'application/json': {
          schema: deviceResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const updateDeviceRoute = createRoute({
  method: 'patch',
  path: '/{deviceID}',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Update device by ID',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: deviceIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: patchDeviceRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Device updated successfully',
      content: {
        'application/json': {
          schema: deviceMutationResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});

export const deleteDeviceRoute = createRoute({
  method: 'delete',
  path: '/{deviceID}',
  middleware: [isAdmin],
  tags: ['Administration'],
  summary: 'Delete device by ID',
  security: [{ AuthorizationBearer: [] }],
  request: {
    params: deviceIdParamSchema,
  },
  responses: {
    200: {
      description: 'Device deleted successfully',
      content: {
        'application/json': {
          schema: deviceMutationResponseSchema,
        },
      },
    },
    ...unprocessableEntityResponse,
    ...unauthorizedErrorResponse,
    ...internalServerErrorResponse,
    ...decryptionErrorResponse,
  },
});
