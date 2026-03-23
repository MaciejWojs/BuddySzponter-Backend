import { z } from 'zod';

// ── Payload schemas (just the data) ─────────────────────────────────

export const registerPayloadSchema = z.object({
  message: z.string(),
});

export const loginPayloadSchema = z.object({
  message: z.string(),
  accessToken: z.jwt().openapi({
    description: 'JWT access token, valid for 15 minutes',
  }),
});

export const refreshPayloadSchema = z.object({
  message: z.string(),
  accessToken: z.jwt().openapi({
    description: 'JWT access token, valid for 15 minutes',
  }),
});

export const logoutPayloadSchema = z.object({
  message: z.string(),
});

export const mePayloadSchema = z.object({
  id: z.number().positive().min(1).openapi({
    description: 'Unique identifier for the user',
    example: 123,
  }),
  avatar: z.string().nullable().openapi({
    description: 'Random generated avatar identifier for avatar',
    example: 'a1b2c3d4e5f6g7h8i9j0',
  }),
  email: z.email().openapi({
    description: 'Email address for the user',
    example: 'user@example.com',
  }),
  nickname: z.string().max(100).openapi({
    description: 'Nickname for the user',
    example: 'john_doe',
  }),
  createdAt: z.date().openapi({
    description: 'Timestamp when the user was created',
    example: '2023-01-01T00:00:00Z',
  }),
});

// ── Types ───────────────────────────────────────────────────────────
//! These types can be used in the route handlers to ensure type safety when returning responses
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type RefreshPayload = z.infer<typeof refreshPayloadSchema>;
export type LogoutPayload = z.infer<typeof logoutPayloadSchema>;
export type MePayload = z.infer<typeof mePayloadSchema>;
