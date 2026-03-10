import crypto from 'node:crypto';

import { configProvider } from '@/config/configProvider';

const algorithm = 'aes-256-gcm';

const key = Buffer.from(configProvider.get('PAYLOAD_SECRET'), 'hex');

export function encryptPayload(data: object) {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };
}
