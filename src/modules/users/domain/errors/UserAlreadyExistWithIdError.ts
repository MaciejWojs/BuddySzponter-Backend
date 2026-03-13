import { UserId } from '@/shared/value-objects';

import { UserAlreadyExistError } from './UserAlreadyExistError';

export class UserAlreadyExistWithIdError extends UserAlreadyExistError {
  constructor(id: UserId) {
    super('id', `${id.value}`);
  }
}
