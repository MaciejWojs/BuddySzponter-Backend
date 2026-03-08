import { RoleId } from '@/shared/value-objects';

import { RoleName } from '../value-objects';

export class Role {
  constructor(
    readonly id: RoleId,
    readonly name: RoleName,
    readonly createdAt: Date,
  ) {}
  private copy(changes: Partial<Role>): Role {
    return new Role(
      changes.id ?? this.id,
      changes.name ?? this.name,
      changes.createdAt ?? this.createdAt,
    );
  }
  updateName(name: RoleName): Role {
    return this.copy({ name });
  }
}
