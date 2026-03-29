import { z } from 'zod';

export const administrationDummyResponseSchema = z.object({
  module: z.string().min(1),
  status: z.literal('dummy'),
  message: z.string().min(1),
});

export const administrationDummyWithChildrenResponseSchema =
  administrationDummyResponseSchema.extend({
    children: z.array(z.string().min(1)),
  });
