import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';

export class PasswordWithoutSpecialCharacterError extends PasswordValidationError {
  constructor() {
    super(
      'Password must contain at least one special character: ! @ # $ % ^ & * ( ) , . ? " : { } | < >',
    );
  }
}
