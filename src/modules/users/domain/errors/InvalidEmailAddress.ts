import { ValidationError } from '@/shared/errors/Specialized/ValidationError';

export class InvalidEmailAddress extends ValidationError {
  constructor(email: string) {
    super(`The email address "${email}" is not valid.`);
  }
}
