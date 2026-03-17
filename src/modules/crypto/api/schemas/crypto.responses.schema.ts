import { z } from 'zod';

export const handshakeResponseSchema = z.object({
  serverPublicKey: z
    .base64('Invalid base64 string for serverPublicKey')
    .refine((v) => {
      const buf = Buffer.from(v, 'base64');
      return buf.length === 65;
    }, 'Invalid ECDH public key'),

  sessionId: z.uuid(),
});
