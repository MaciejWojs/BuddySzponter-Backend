import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';

export class PasswordWithoutUpperCaseError extends PasswordValidationError {
  constructor() {
    super('Password must contain at least one uppercase letter');
  }
}
