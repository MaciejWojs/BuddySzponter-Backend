import { z } from 'zod';

export const patchUserSchema = z.object({
  nickname: z.string().min(3).max(20).optional(),
  email: z.email().optional(),
  password: z.string().min(8).optional(),
});

export const deleteUserSchema = z.object({
  userId: z.int(),
});

export type PatchUserInput = z.infer<typeof patchUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
