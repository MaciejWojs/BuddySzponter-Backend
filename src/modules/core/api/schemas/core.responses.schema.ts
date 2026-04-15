import { z } from '@hono/zod-openapi';

export const appVersionSchema = z.object({
  version: z.string().min(1),
  codename: z.string().nullable(),
  isSupported: z.boolean()
});

export const supportedVersionsResponseSchema = z.array(appVersionSchema);

export const supportedLocalesResponseSchema = z.array(z.string());

export const coreLocalePayloadResponseSchema = z
  .record(z.string(), z.unknown())
  .openapi({
    description: 'Key-value map of translation strings'
  });

export const coreLocaleNotFoundResponseSchema = z.object({
  message: z.string()
});

export const uploadLocaleResponseSchema = z.object({
  message: z.any(),
  hash: z.string(),
  lang: z.string(),
  version: z.string()
});
