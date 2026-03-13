import { ConflictError } from '@/shared/errors/Specialized/ConflictError';

export class UserAlreadyExistError extends ConflictError {
  constructor(type: 'id' | 'email', itemValue: string) {
    const finalMessage = `User already exists with this ${type}: '${itemValue}'`;
    super(finalMessage);
    this.name = 'UserAlreadyExistError';
  }
}
