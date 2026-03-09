import z from 'zod';

export const internalServerErrorResponseSchema = z.object({
  message: z.literal('Internal Server Error'),
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
