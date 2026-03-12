import { PasswordValidationError } from '@/shared/errors/Domian/PasswordValidationError';
export class PasswordScoreTooLowError extends PasswordValidationError {
  constructor(score: number, suggestions: string[]) {
    super(`Password score: ${score} is too weak: ${suggestions.join(' ')}`);
  }
}
