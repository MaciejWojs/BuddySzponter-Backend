import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';

export class PasswordWithoutDigitError extends PasswordValidationError {
  constructor() {
    super('Password must contain at least one digit');
  }
}
