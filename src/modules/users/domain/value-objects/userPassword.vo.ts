import { password } from 'bun';
import zxcvbn from 'zxcvbn';

export class Password {
  static readonly MIN_SCORE = 3;
  static readonly MAX_LENGTH = 255;
  static readonly MIN_LENGTH = 8;
  static readonly HASH_ALGORITHM = 'argon2id';

  private constructor(private readonly hashedPass: string) {}

  static async create(raw: string): Promise<Password> {
    raw = raw.trim();
    const passwordError = this.checkPasswordRequirements(raw);
    if (passwordError) {
      throw passwordError;
    }

    const hashed = await password.hash(raw, {
      algorithm: this.HASH_ALGORITHM,
    });

    return new Password(hashed);
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  get value(): string {
    return this.hashedPass;
  }

  async verify(pass: string): Promise<boolean> {
    return await password.verify(pass, this.hashedPass);
  }

  private static checkPasswordRequirements(pass: string): Error | false {
    const { score, feedback } = zxcvbn(pass);
    if (score < this.MIN_SCORE) {
      return new Error(
        `Password is too weak: ${feedback.suggestions.join(' ')}`,
      );
    }

    if (pass.length < this.MIN_LENGTH) {
      return new Error(
        `Password must be at least ${this.MIN_LENGTH} characters long`,
      );
    }

    if (pass.length > this.MAX_LENGTH) {
      return new Error(
        `Password must be at most ${this.MAX_LENGTH} characters long`,
      );
    }

    if (pass === pass[0]!.repeat(pass.length)) {
      return new Error('Password cannot consist of the same character');
    }

    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasDigit = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (!hasUpper)
      return new Error('Password must contain at least one uppercase letter');
    if (!hasLower)
      return new Error('Password must contain at least one lowercase letter');
    if (!hasDigit) return new Error('Password must contain at least one digit');
    if (!hasSpecialChar)
      return new Error('Password must contain at least one special character');

    return false;
  }
}
