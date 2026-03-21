import { z } from '@hono/zod-openapi';

export const healthPayloadResponseSchema = z.object({
  service: z.string().min(5).max(100),
  version: z.string().min(5).max(20),
  timestamp: z.iso.datetime(),
});
