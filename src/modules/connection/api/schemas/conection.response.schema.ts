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
  expiresAt: z.coerce.date(),
});

export const connectionJoinResponseSuccessSchema = z.object({
  connectionUUID: z.uuid().openapi({
    description: 'Unique identifier for the connection session',
    example: 'c9e4f1eb-4454-4aa4-887d-6879040b6b31',
  }),
});

export const connectionCreateResponseFailSchema = z.object({});
export const connectionJoinResponseFailSchema = z.object({});
