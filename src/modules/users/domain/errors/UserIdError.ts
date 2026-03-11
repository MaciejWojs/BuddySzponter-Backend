import { BaseIdError } from '@/shared/errors/Domian/BaseIdError';

export class UserIdError extends BaseIdError {
  constructor(id: number) {
    super(id, 'User');
  }
}
