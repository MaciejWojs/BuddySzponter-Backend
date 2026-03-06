import { z } from 'zod';

export const createSessionSchema = z.object({
  userId: z.int().optional(),
  deviceInfo: z.string().optional(),
  sessionCode: z.string().min(8),
  sessionPassword: z.string().min(8).max(64),
});

// export const getSessionsSchema = z.object({
//   userId: z.string().min(8).max(8),
// });

export const deleteSessionSchema = z.object({
  id: z.int(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
// export type GetSessionsInput = z.infer<typeof getSessionsSchema>;
export type DeleteSessionInput = z.infer<typeof deleteSessionSchema>;
