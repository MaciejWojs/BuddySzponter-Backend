import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';

export class PasswordWithoutLowerCaseError extends PasswordValidationError {
  constructor() {
    super('Password must contain at least one lowercase letter');
  }
}
