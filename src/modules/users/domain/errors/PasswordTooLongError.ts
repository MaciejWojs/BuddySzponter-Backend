import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';

export class PasswordTooLongError extends PasswordValidationError {
  constructor(maxLength: number) {
    super(`Password must be at most ${maxLength} characters long`);
  }
}
