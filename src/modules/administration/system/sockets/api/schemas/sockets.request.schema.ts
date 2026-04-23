import { z } from 'zod';

export const connectionIdParamSchema = z.object({
  connectionId: z.uuid().openapi({
    param: {
      name: 'connectionId',
      in: 'path'
    },
    description: 'Connection UUID',
    example: '5bf78b31-89f9-4f24-b26b-43f2c4ef7c1b'
  })
});

export const connectionSocketParamsSchema = z.object({
  connectionId: z.uuid().openapi({
    param: {
      name: 'connectionId',
      in: 'path'
    },
    description: 'Connection UUID',
    example: '5bf78b31-89f9-4f24-b26b-43f2c4ef7c1b'
  }),
  socketId: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: 'socketId',
        in: 'path'
      },
      description: 'Socket.IO socket ID',
      example: '3Q6A2Jj0S7hUlb7sAAAB'
    })
});
