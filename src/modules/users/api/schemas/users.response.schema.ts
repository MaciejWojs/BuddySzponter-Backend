import { z } from 'zod';

export const patchUserResponseSchema = z.object({
  message: z.string().min(2).max(255)
});
export const deleteUserResponseSchema = z.object({
  message: z.string().min(2).max(255)
});

export const postUserAvatarResponseSchema = z.object({
  message: z.string().min(2).max(255),
  avatar: z.string().length(32)
});
