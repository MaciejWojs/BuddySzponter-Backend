import { z } from 'zod';

export const versionResponseSchema = z.object({
  id: z.uuid().openapi({
    description: 'Version UUID',
    example: '0f0efaa0-736a-432f-b132-afddfe95c1e5'
  }),
  version: z.string().openapi({
    description: 'Version in x.y.z format',
    example: '1.2.0'
  }),
  codename: z.string().nullable().openapi({
    description: 'Optional codename',
    example: 'spring-release'
  }),
  isSupported: z.boolean().openapi({
    description: 'Support flag',
    example: true
  }),
  langHash: z.string().openapi({
    description: 'Language bundle hash for this version',
    example: 'd9f04f9cbe8f11f260af95e30bf26736'
  })
});

export const versionsResponseSchema = z.array(versionResponseSchema);

export const versionsTotalResponseSchema = z.object({
  total: z.number().int().min(0).openapi({
    example: 12,
    description: 'Total number of app versions'
  })
});

export const versionMutationResponseSchema = z.object({
  message: z.string().min(2).max(255)
});

export type VersionResponse = z.infer<typeof versionResponseSchema>;
