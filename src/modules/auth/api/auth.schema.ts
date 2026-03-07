import { z } from 'zod';

export const registerSchema = z
  .object({
    nickname: z.string().min(3).max(20),
    email: z.email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['passwordConfirm'],
      });
    }
  });

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const logoutSchema = z.object({
  refreshToken: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
