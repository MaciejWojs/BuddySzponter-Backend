import { z } from 'zod';

export const languageDeleteResponseSchema = z.object({
  message: z.string().min(2).max(255),
});
