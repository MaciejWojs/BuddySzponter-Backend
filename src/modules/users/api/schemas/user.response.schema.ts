import { z } from 'zod';

export const getUserResponseSchema = z.object({
  id: z.number().positive().min(1),
  roleId: z.number().positive().min(1),
  email: z.email(),
  nickname: z.string().max(100),
  avatar: z.string().nullable(),
  isBanned: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getUsersResponseSchema = z.array(getUserResponseSchema);

export const patchUserResponseSchema = z.object({
  message: z.string().min(2).max(255),
});
export const deleteUserResponseSchema = z.object({
  message: z.string().min(2).max(255),
});

export const postUserAvatarResponseSchema = z.object({
  message: z.string().min(2).max(255),
});
