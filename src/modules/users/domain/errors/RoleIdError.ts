import { BaseIdError } from '@/shared/errors/Domian/BaseIdError';

export class RoleIdError extends BaseIdError {
  constructor(id: number) {
    super(id, 'Role');
  }
}
