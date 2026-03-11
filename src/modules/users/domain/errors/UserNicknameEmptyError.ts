import { ValidationError } from '@/shared/errors/Specialized/ValidationError';

export class UserNicknameEmptyError extends ValidationError {
  constructor() {
    super('User nickname cannot be empty');
  }
}
