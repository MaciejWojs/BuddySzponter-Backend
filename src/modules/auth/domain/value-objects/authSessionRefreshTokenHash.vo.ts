import { createHash, randomBytes, timingSafeEqual } from 'crypto';

import { APP_CONFIG } from '@/config/appConfig';

export class AuthSessionRefreshToken {
  private constructor(private readonly hashedToken: string) {}

  static create(): {
    raw: string;
    hashed: AuthSessionRefreshToken;
  } {
    const raw = randomBytes(APP_CONFIG.crypto.refreshTokenBytes).toString(
      'hex',
    );

    const hash = createHash('sha256').update(raw).digest('hex');

    return {
      raw,
      hashed: new AuthSessionRefreshToken(hash),
    };
  }

  static fromHash(hash: string): AuthSessionRefreshToken {
    return new AuthSessionRefreshToken(hash);
  }

  get value(): string {
    return this.hashedToken;
  }

  verify(raw: string): boolean {
    const hash = createHash('sha256').update(raw).digest();

    const stored = Buffer.from(this.hashedToken, 'hex');

    if (hash.length !== stored.length) {
      return false;
    }

    return timingSafeEqual(hash, stored);
  }
}
