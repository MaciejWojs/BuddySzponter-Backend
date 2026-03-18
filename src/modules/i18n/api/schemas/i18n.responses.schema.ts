import { z } from '@hono/zod-openapi';

export const localePayloadSchema = z.record(z.string(), z.unknown()).openapi({
  description: 'Key-value map of translation strings',
});

export const localeNotFoundSchema = z.object({
  message: z.string(),
});
