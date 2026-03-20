import { z } from 'zod';

export const registerBodySchema = z
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

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fingerprint: z.string().min(1),
  os: z.string().optional(),
  name: z.string().optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.jwt(),
});

export const logoutSchema = z.object({
  refreshToken: z.jwt(),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
