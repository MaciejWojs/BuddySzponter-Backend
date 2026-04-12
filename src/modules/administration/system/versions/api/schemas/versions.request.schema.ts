import { z } from 'zod';

const queryBooleanSchema = z.preprocess((value) => {
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

const appVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'Version must be in x.y.z format');

export const versionIdParamSchema = z.object({
  id: z.uuid().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '0f0efaa0-736a-432f-b132-afddfe95c1e5',
  }),
});

export const getVersionsQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0).openapi({
    example: 0,
    description: 'Pagination offset',
  }),
  limit: z.coerce.number().int().min(1).max(100).default(10).openapi({
    example: 10,
    description: 'Pagination limit',
  }),
  version: appVersionSchema.optional().openapi({
    example: '1.0.0',
    description: 'Filter by exact semantic version',
  }),
  codename: z.string().trim().min(1).max(100).optional().openapi({
    example: 'alpha',
    description: 'Filter by codename (partial match)',
  }),
  isSupported: queryBooleanSchema.optional().openapi({
    example: true,
    description: 'Filter by support flag',
  }),
});

export const createVersionRequestSchema = z.object({
  version: appVersionSchema.openapi({
    example: '1.2.0',
    description: 'Version in x.y.z format',
  }),
  codename: z.string().trim().min(1).max(100).nullable().optional().openapi({
    example: 'spring-release',
    description: 'Optional version codename',
  }),
  isSupported: z.boolean().openapi({
    example: true,
    description: 'Whether version is supported',
  }),
});

export const patchVersionRequestSchema = z
  .object({
    version: appVersionSchema.optional().openapi({
      example: '1.2.1',
      description: 'Version in x.y.z format',
    }),
    codename: z.string().trim().min(1).max(100).nullable().optional().openapi({
      example: 'spring-release-hotfix',
      description: 'Optional version codename',
    }),
    isSupported: queryBooleanSchema.optional().openapi({
      example: false,
      description: 'Whether version is supported',
    }),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided',
  });

export type GetVersionsQuery = z.infer<typeof getVersionsQuerySchema>;
export type CreateVersionInput = z.infer<typeof createVersionRequestSchema>;
export type PatchVersionInput = z.infer<typeof patchVersionRequestSchema>;
