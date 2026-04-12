import { z } from 'zod';

export const handshakeRequestSchema = z.object({
  clientPublicKey: z
    .base64('Invalid base64 string for clientPublicKey')
    .refine((v) => {
      const buf = Buffer.from(v, 'base64');
      return buf.length === 65;
    }, 'Invalid ECDH public key')
});
