import { createHash, timingSafeEqual } from 'crypto';
import { sign, verify } from 'hono/jwt';

import { configProvider } from '@/config/configProvider';

export class AuthSessionRefreshToken {
  private constructor(private readonly hashedToken: string) {}

  static async create(params: { sessionId: string; userId: number }): Promise<{
    raw: string;
    hashed: AuthSessionRefreshToken;
  }> {
    const raw = await sign(
      {
        sessionId: params.sessionId,
        sub: params.userId,
        type: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      configProvider.get('JWT_REFRESH_SECRET'),
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

  static async decode(raw: string): Promise<{
    sessionId: string;
    userId: number;
  }> {
    const payload = await verify(
      raw,
      configProvider.get('JWT_REFRESH_SECRET'),
      'HS256',
    );

    if (!payload.sessionId || !payload.sub) {
      throw new Error('Invalid refresh token payload');
    }

    return {
      sessionId: payload.sessionId as string,
      userId: payload.sub as number,
    };
  }
}
