import { z } from 'zod';

import {
  appVersionServerSchema,
  localeCodeSchema
} from '@/modules/core/api/schemas/core.requests.schema';

export const versionLangParamsSchema = z.object({
  version: appVersionServerSchema.openapi({
    param: {
      name: 'version',
      in: 'path'
    },
    description: 'Application version in x.y.z format',
    example: '1.0.0'
  }),
  lang: localeCodeSchema.openapi({
    param: {
      name: 'lang',
      in: 'path'
    },
    description: 'Language code',
    example: 'pl'
  })
});

export const versionParamsSchema = z.object({
  version: appVersionServerSchema.openapi({
    param: {
      name: 'version',
      in: 'path'
    },
    description: 'Application version in x.y.z format',
    example: '1.0.0'
  })
});
