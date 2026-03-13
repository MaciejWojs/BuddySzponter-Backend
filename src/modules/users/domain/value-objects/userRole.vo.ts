import { RoleId } from './RoleId.vo';
import { RoleName } from './RoleName.vo';

export class UserRole {
  static MAX_NAME_LENGTH = 100;
  static MIN_NAME_LENGTH = 3;
  constructor(
    private readonly roleId: RoleId,
    private readonly roleName: RoleName,
    readonly description?: string,
  ) {}

  get name(): string {
    return this.roleName.value;
  }

  get id(): number {
    return this.roleId.value;
  }
}
