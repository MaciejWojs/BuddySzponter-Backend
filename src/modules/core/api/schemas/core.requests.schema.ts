import { z } from '@hono/zod-openapi';

const multipartBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'on') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'off') {
      return false;
    }
  }

  return value;
}, z.boolean());

export const localeCodeSchema = z
  .string()
  .trim()
  .min(2)
  .max(16)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid language code')
  .openapi({
    description: 'Language code used for locale file path',
    example: 'it',
  });

export const appVersionServerSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'Version must be in x.y.z format')
  .openapi({
    description: 'Application version in x.y.z format',
    example: '1.0.0',
  });

export const coreLocaleQuerySchema = z.object({
  lang: localeCodeSchema.openapi({
    param: {
      name: 'lang',
      in: 'query',
    },
    description: 'Language code',
    example: 'pl',
  }),
  version: appVersionServerSchema.openapi({
    param: {
      name: 'version',
      in: 'query',
    },
    description: 'Application version in x.y.z format',
    example: '1.0.0',
  }),
});

export const supportedLocalesByVersionParamsSchema = z.object({
  version: appVersionServerSchema.openapi({
    param: {
      name: 'version',
      in: 'path',
    },
    description: 'Application version in x.y.z format',
    example: '1.0.0',
  }),
});

export const createAppVersionRequestSchema = z.object({
  version: appVersionServerSchema,
  codename: z.string().min(1).nullable().optional().openapi({
    description: 'Optional app codename',
    example: 'alpha',
  }),
  isSupported: multipartBooleanSchema.optional().openapi({
    description: 'Whether this version is supported',
    example: true,
  }),
});

export const uploadLocaleFormSchema = z.object({
  file: z.any().openapi({
    type: 'string',
    format: 'binary',
    description: 'Locale JSON file (max 10MB)',
  }),
  lang: localeCodeSchema,
  version: appVersionServerSchema,
});
