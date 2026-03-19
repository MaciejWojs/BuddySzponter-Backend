import { z } from 'zod';

// ── Payload schemas (just the data) ─────────────────────────────────

export const registerPayloadSchema = z.object({
  message: z.string(),
});

export const loginPayloadSchema = z.object({
  message: z.string(),
  accessToken: z.jwt(),
});

export const refreshPayloadSchema = z.object({
  message: z.string(),
  accessToken: z.jwt(),
});

export const logoutPayloadSchema = z.object({
  message: z.string(),
});

export const mePayloadSchema = z.object({
  message: z.string(),
});

// ── Types ───────────────────────────────────────────────────────────
//! These types can be used in the route handlers to ensure type safety when returning responses
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type RefreshPayload = z.infer<typeof refreshPayloadSchema>;
export type LogoutPayload = z.infer<typeof logoutPayloadSchema>;
export type MePayload = z.infer<typeof mePayloadSchema>;
