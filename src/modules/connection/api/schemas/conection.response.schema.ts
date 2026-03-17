import { z } from 'zod';

export const connectionCreateResponseSuccessSchema = z.object({
  code: z.string(),
  connectionUUID: z.uuid(),
  expiresAt: z.coerce.date(),
});
export const connectionJoinResponseSuccessSchema = z.object({
  connectionUUID: z.uuid(),
});

export const connectionCreateResponseFailSchema = z.object({});
export const connectionJoinResponseFailSchema = z.object({});
