import { z } from '@hono/zod-openapi';

import { supportedLocales } from '@/shared/locales';

export const getLocaleQuerySchema = z.object({
  lang: z.enum(supportedLocales).openapi({
    param: {
      name: 'lang',
      in: 'query',
    },
    description: 'Language code',
    example: 'pl',
  }),
});
