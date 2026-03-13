import { RoleIdError } from '../errors/RoleIdError';

export class RoleId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new RoleIdError(id);
    }
  }

  get value(): number {
    return this.id;
  }
}
