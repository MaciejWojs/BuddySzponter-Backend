import { createDecipheriv } from 'crypto';

import { ValidationError } from '@/shared/errors/Specialized/ValidationError';

import { EncryptedPayload } from '../api/schemas/encryptedPayload.schema';

export function decryptPayload(p: EncryptedPayload, key: string): object {
  const { payload } = p;
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const encrypted = Buffer.from(payload.data, 'base64');

  const keyBuffer = Buffer.from(key, 'base64');

  const decipher = createDecipheriv('aes-256-gcm', keyBuffer, iv);

  try {
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString());
  } catch {
    throw new ValidationError('Invalid encrypted payload');
  }
}
