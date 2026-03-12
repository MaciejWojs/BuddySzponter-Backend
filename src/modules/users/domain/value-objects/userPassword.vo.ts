import { password } from 'bun';
import zxcvbn from 'zxcvbn';

import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';

import {
  PasswordScoreTooLowError,
  PasswordTooLongError,
  PasswordTooShortError,
  PasswordWithoutDigitError,
  PasswordWithoutLowerCaseError,
  PasswordWithoutSpecialCharacterError,
  PasswordWithoutUpperCaseError,
} from '../errors';

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
    if (pass.length < this.MIN_LENGTH) {
      return new PasswordTooShortError(this.MIN_LENGTH);
    }

    if (pass.length > this.MAX_LENGTH) {
      return new PasswordTooLongError(this.MAX_LENGTH);
    }

    if (pass === pass[0]!.repeat(pass.length)) {
      return new PasswordValidationError(
        'Password cannot consist of the same character',
      );
    }

    const { score, feedback } = zxcvbn(pass);
    if (score < this.MIN_SCORE) {
      return new PasswordScoreTooLowError(score, feedback.suggestions);
    }

    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasDigit = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (!hasUpper) return new PasswordWithoutUpperCaseError();
    if (!hasLower) return new PasswordWithoutLowerCaseError();
    if (!hasDigit) return new PasswordWithoutDigitError();
    if (!hasSpecialChar) return new PasswordWithoutSpecialCharacterError();

    return false;
  }
}
