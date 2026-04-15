import { z } from '@hono/zod-openapi';
import ISO6391 from 'iso-639-1';

export const localeCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (code) => ISO6391.validate(code),
    'Invalid language code (must be ISO-639-1)'
  )
  .openapi({
    description: 'Language code used for locale file path',
    example: 'it'
  });

export const appVersionServerSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'Version must be in x.y.z format')
  .openapi({
    description: 'Application version in x.y.z format',
    example: '1.0.0'
  });

export const coreLocaleQuerySchema = z.object({
  lang: localeCodeSchema.openapi({
    param: {
      name: 'lang',
      in: 'query'
    },
    description: 'Language code',
    example: 'pl'
  }),
  version: appVersionServerSchema.openapi({
    param: {
      name: 'version',
      in: 'query'
    },
    description: 'Application version in x.y.z format',
    example: '1.0.0'
  })
});

export const supportedLocalesByVersionParamsSchema = z.object({
  version: appVersionServerSchema.openapi({
    param: {
      name: 'version',
      in: 'path'
    },
    description: 'Application version in x.y.z format',
    example: '1.0.0'
  })
});

export const uploadLocaleFormSchema = z.object({
  file: z.any().openapi({
    type: 'string',
    format: 'binary',
    description: 'Locale JSON file (max 10MB)'
  }),
  lang: localeCodeSchema,
  version: appVersionServerSchema
});
