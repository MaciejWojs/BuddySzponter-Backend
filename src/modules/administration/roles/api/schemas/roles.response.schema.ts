import { z } from 'zod';

export const roleResponseSchema = z.object({
  id: z.number().int().positive().openapi({
    description: 'Role ID',
    example: 1
  }),
  name: z.string().openapi({
    description: 'Role name',
    example: 'ADMIN'
  }),
  description: z.string().nullable().openapi({
    description: 'Role description',
    example: 'Administrative role'
  })
});

export const getRolesResponseSchema = z.array(roleResponseSchema);

export const roleMutationResponseSchema = z.object({
  message: z.string().min(2).max(255)
});

export type RoleResponse = z.infer<typeof roleResponseSchema>;
