import { z } from 'zod';

export const connectionCreateResponseSuccessSchema = z.object({
  code: z.string(),
  connectionUUID: z.string(),
  expiresAt: z.coerce.date(),
});
export const connectionJoinResponseSuccessSchema = z.object({
  connectionUUID: z.string(),
});

export const connectionCreateResponseFailSchema = z.object({});
export const connectionJoinResponseFailSchema = z.object({});
