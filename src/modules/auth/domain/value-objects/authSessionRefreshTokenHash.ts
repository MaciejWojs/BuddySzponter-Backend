import { password } from 'bun';

export class AuthSessionRefreshTokenHash {
  private constructor(private readonly hash: string) {}

  static async create(
    plainTextToken: string,
  ): Promise<AuthSessionRefreshTokenHash> {
    const hash = await password.hash(plainTextToken, {
      algorithm: 'argon2id',
    });
    return new AuthSessionRefreshTokenHash(hash);
  }

  get value(): string {
    return this.hash;
  }
  async verify(hasd: string): Promise<boolean> {
    return await password.verify(hasd, this.hash);
  }
}
