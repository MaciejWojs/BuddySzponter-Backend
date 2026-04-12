import { z } from 'zod';

export const roleIdParamSchema = z.object({
  roleID: z.string().openapi({
    param: {
      name: 'roleID',
      in: 'path',
    },
    type: 'integer',
    example: '1',
  }),
});

export const createRoleRequestSchema = z.object({
  name: z.string().trim().min(1).max(100).openapi({
    description: 'Role name',
    example: 'MODERATOR',
  }),
  description: z.string().trim().max(255).nullable().optional().openapi({
    description: 'Optional role description',
    example: 'Can moderate content',
  }),
});

export const patchRoleRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional().openapi({
      description: 'Role name',
      example: 'MODERATOR',
    }),
    description: z.string().trim().max(255).nullable().optional().openapi({
      description: 'Optional role description',
      example: 'Can moderate content',
    }),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided',
  });
