import { ValidationError } from '../Specialized/ValidationError';

export class PasswordValidationError extends ValidationError {
  constructor(message: string) {
    super(`Password validation failed: ${message}`);
  }

  static fromPasswordError(error: Error): PasswordValidationError {
    return new PasswordValidationError(error.message);
  }

  override formatError(): string {
    return `PasswordValidationError: ${this.name}: ${this.message}`;
  }
}
