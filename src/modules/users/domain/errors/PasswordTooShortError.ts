import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';

export class PasswordTooShortError extends PasswordValidationError {
  constructor(minLength: number) {
    super(`Password must be at least ${minLength} characters long`);
  }
}
