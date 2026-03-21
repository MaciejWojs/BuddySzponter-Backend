import { z } from 'zod';

export const internalServerErrorResponseSchema = z.object({
  message: z.literal('Internal Server Error'),
});

export const defaultErrorResponseSchema = z.object({
  message: z.string(),
  cause: z.array(
    z
      .object({
        field: z.string('Field name must be a string'),
        error: z.string('Error message must be a string'),
      })
      .strict(),
  ),
});

/**
 * 422 Validation error (zValidator / Zod)
 */
export const validationErrorResponseSchema = z.object({
  message: z.literal('ValidationError'),
  cause: z.array(
    z.object({
      field: z.string(),
      error: z.string(),
    }),
  ),
});

export const decryptionErrorResponseSchema = z.object({
  message: z.enum([
    'Invalid encrypted payload',
    'Data is not encrypted or wrong payload format',
    'Invalid JSON request body',
  ]),
});

export const unauthorizedErrorResponseSchema = z.object({
  message: z.enum([
    'Missing X-session-id header',
    'Invalid or expired session UUID',
  ]),
});

// error 503
export const serviceUnavailableErrorResponseSchema = z.object({
  message: z.literal('Service Unavailable'),
});
