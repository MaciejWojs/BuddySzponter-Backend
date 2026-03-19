import { randomBytes, timingSafeEqual } from 'crypto';

import { APP_CONFIG } from '@/config/appConfig';

export class AuthSessionRefreshToken {
  private constructor(private readonly token: string) {}

  static async create(): Promise<AuthSessionRefreshToken> {
    const buffer = randomBytes(APP_CONFIG.crypto.refreshTokenBytes);
    const token = buffer.toString('hex');
    return new AuthSessionRefreshToken(token);
  }

  get value(): string {
    return this.token;
  }

  static fromExisting(token: string): AuthSessionRefreshToken {
    return new AuthSessionRefreshToken(token);
  }

  verify(raw: string): boolean {
    const bufA = Buffer.from(this.token, 'hex');
    const bufB = Buffer.from(raw, 'hex');

    if (bufA.length !== bufB.length) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  }
}
