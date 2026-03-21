import {
  decryptionErrorResponseSchema,
  internalServerErrorResponseSchema,
  serviceUnavailableErrorResponseSchema,
  unauthorizedErrorResponseSchema,
  validationErrorResponseSchema,
} from '@shared/api/schemas/error.schema';

export const unprocessableEntityResponse = {
  422: {
    description: 'Validation error',
    content: {
      'application/json': {
        schema: validationErrorResponseSchema,
      },
    },
  },
};

export const internalServerErrorResponse = {
  500: {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: internalServerErrorResponseSchema,
      },
    },
  },
};

export const decryptionErrorResponse = {
  400: {
    description: 'Invalid encrypted payload',
    content: {
      'application/json': {
        schema: decryptionErrorResponseSchema,
      },
    },
  },
};

export const unauthorizedErrorResponse = {
  401: {
    description: 'Unauthorized - missing or invalid session',
    content: {
      'application/json': {
        schema: unauthorizedErrorResponseSchema,
      },
    },
  },
};

export const serviceUnavailableErrorResponse = {
  503: {
    description: 'Service Unavailable',
    content: {
      'application/json': {
        schema: serviceUnavailableErrorResponseSchema,
      },
    },
  },
};
