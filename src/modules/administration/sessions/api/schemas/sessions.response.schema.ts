import { z } from 'zod';

export const sessionResponseSchema = z.object({
  id: z.uuid().openapi({
    description: 'Auth session UUID',
    example: 'd2faf722-af7c-4925-aa67-1cc1ef579d82',
  }),
  userId: z.number().int().positive().openapi({
    description: 'User identifier assigned to session',
    example: 123,
  }),
  deviceId: z.uuid().openapi({
    description: 'Device identifier assigned to session',
    example: '6f4f2c9c-6a7f-4b37-9324-0fc8a5f5f951',
  }),
  ipAddress: z.string().openapi({
    description: 'Client IP address used by session',
    example: '192.168.0.10',
  }),
  userAgent: z.string().openapi({
    description: 'Client user agent',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  }),
  revoked: z.boolean().openapi({
    description: 'Whether session is revoked',
    example: false,
  }),
  createdAt: z.date().openapi({
    description: 'Creation date of the session',
    example: '2026-03-29T15:55:00.386Z',
  }),
  expiresAt: z.date().openapi({
    description: 'Expiration date of the session',
    example: '2026-04-05T15:55:00.386Z',
  }),
});

export const sessionsResponseSchema = z.array(sessionResponseSchema);

export const terminateSessionResponseSchema = z.object({
  message: z.string().min(2).max(255),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
