import { UserIdError } from '@/modules/users/domain/errors/UserIdError';

export class UserId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new UserIdError(id);
    }
  }

  get value(): number {
    return this.id;
  }
}
