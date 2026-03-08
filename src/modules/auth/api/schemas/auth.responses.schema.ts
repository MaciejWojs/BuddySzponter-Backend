import { z } from 'zod';

// ── Shared error schemas ────────────────────────────────────────────

export const internalServerErrorResponseSchema = z.object({
  success: z.literal(false),
});

/**
 * 422 Validation error (zValidator / Zod)
 */
export const validationErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    name: z.literal('ValidationError'),
    issues: z.array(
      z.object({
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string(),
      }),
    ),
  }),
});

/**
 * Helper – wraps a payload schema with standard error codes
 */
const withValidationError = <T extends z.ZodTypeAny>(schema: T) => ({
  200: schema,
  422: validationErrorResponseSchema,
  500: internalServerErrorResponseSchema,
});

// ── Payload schemas (just the data) ─────────────────────────────────

export const registerPayloadSchema = z.object({
  message: z.string(),
});

export const loginPayloadSchema = z.object({
  message: z.string(),
});

export const refreshPayloadSchema = z.object({
  message: z.string(),
});

export const logoutPayloadSchema = z.object({
  message: z.string(),
});

export const mePayloadSchema = z.object({
  message: z.string(),
});

// ── Full response schemas (payload + HTTP status codes) ─────────────
//! These will be used in the zod open api plugin to generate the OpenAPI spec for the API responses

export const registerResponseSchema = withValidationError(
  registerPayloadSchema,
);
export const loginResponseSchema = withValidationError(loginPayloadSchema);
export const refreshResponseSchema = withValidationError(refreshPayloadSchema);
export const logoutResponseSchema = withValidationError(logoutPayloadSchema);
export const meResponseSchema = withValidationError(mePayloadSchema);

// ── Types ───────────────────────────────────────────────────────────
//! These types can be used in the route handlers to ensure type safety when returning responses
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type RefreshPayload = z.infer<typeof refreshPayloadSchema>;
export type LogoutPayload = z.infer<typeof logoutPayloadSchema>;
export type MePayload = z.infer<typeof mePayloadSchema>;

export type InternalServerErrorResponse = z.infer<
  typeof internalServerErrorResponseSchema
>;
export type ValidationErrorResponse = z.infer<
  typeof validationErrorResponseSchema
>;

//! These types represent the full response objects, including the HTTP status codes and potential error responses
export type RegisterResponse = typeof registerResponseSchema;
export type LoginResponse = typeof loginResponseSchema;
export type RefreshResponse = typeof refreshResponseSchema;
export type LogoutResponse = typeof logoutResponseSchema;
export type MeResponse = typeof meResponseSchema;
