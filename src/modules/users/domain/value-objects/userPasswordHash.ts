import { password } from 'bun';
import zxcvbn from 'zxcvbn';

export class Password {
  static readonly MIN_SCORE = 3;

  private constructor(private readonly pass: string) {}

  static async create(raw: string): Promise<Password> {
    const { score } = zxcvbn(raw);
    if (score < this.MIN_SCORE) throw new Error('Password is too weak');

    const hashed = await password.hash(raw, {
      algorithm: 'argon2id',
    });

    return new Password(hashed);
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  get value(): string {
    return this.pass;
  }

  async verify(pass: string): Promise<boolean> {
    return await password.verify(pass, this.pass);
  }
}
