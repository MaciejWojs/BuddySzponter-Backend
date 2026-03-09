import {
  internalServerErrorResponseSchema,
  validationErrorResponseSchema,
} from '@shared/api/schemas/error.schema';

export const unprocessableEntityRespone = {
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
