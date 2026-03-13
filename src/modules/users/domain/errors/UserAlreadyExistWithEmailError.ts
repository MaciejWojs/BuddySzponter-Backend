import { Email } from '../value-objects';
import { UserAlreadyExistError } from './UserAlreadyExistError';

export class UserAlreadyExistWithEmailError extends UserAlreadyExistError {
  constructor(email: Email) {
    super('email', `${email.value}`);
  }
}
