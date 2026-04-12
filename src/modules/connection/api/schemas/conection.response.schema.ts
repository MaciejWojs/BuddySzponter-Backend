import { z } from 'zod';

export const connectionCreateResponseSuccessSchema = z.object({
  code: z.string().openapi({
    description: 'Connection code that can be used to join the session',
    example: 'ABCD1234',
  }),
  connectionUUID: z.uuid().openapi({
    description: 'Unique identifier for the connection session',
    example: 'c9e4f1eb-4454-4aa4-887d-6879040b6b31',
  }),
  token: z.string().openapi({
    description: 'Token used for authenticating the connection session',
    example: 'a1b2c3d4e5f67890abcdef1234567890abcdef12',
  }),
  expiresAt: z.coerce.date(),
});

export const connectionJoinResponseSuccessSchema = z.object({
  connectionUUID: z.uuid().openapi({
    description: 'Unique identifier for the connection session',
    example: 'c9e4f1eb-4454-4aa4-887d-6879040b6b31',
  }),
  token: z.string().openapi({
    description: 'Token used for authenticating the connection session',
    example: 'a1b2c3d4e5f67890abcdef1234567890abcdef12',
  }),
});

export const connectionCreateResponseFailSchema = z.object({});
export const connectionJoinResponseFailSchema = z.object({});
