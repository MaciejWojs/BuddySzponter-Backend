import { UserId } from '@/shared/value-objects';

import { Email, Password, UserNickname } from '../value-objects';
import { UserRole } from '../value-objects/userRole.vo';
export class User {
  constructor(
    readonly id: UserId | null,
    readonly email: Email,
    readonly nickname: UserNickname,
    readonly password: Password,
    readonly role: UserRole,
    readonly isBanned: boolean,
    readonly isDeleted: boolean,
    readonly avatar: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}

  ban(): User {
    return this.copy({ isBanned: true });
  }

  canEditAdminFields(): boolean {
    return this.isAdmin();
  }

  canEditUser(target: User): boolean {
    if (!this.id || !target.id) {
      return false;
    }

    return this.isAdmin() || this.id.value === target.id.value;
  }

  private copy(changes: Partial<User>): User {
    return new User(
      changes.id ?? this.id,
      changes.email ?? this.email,
      changes.nickname ?? this.nickname,
      changes.password ?? this.password,
      changes.role ?? this.role,
      changes.isBanned ?? this.isBanned,
      changes.isDeleted ?? this.isDeleted,
      changes.avatar ?? this.avatar,
      changes.createdAt ?? this.createdAt,
      new Date()
    );
  }

  delete(): User {
    return this.copy({ isDeleted: true });
  }

  isAdmin(): boolean {
    return this.role.name === 'ADMIN';
  }

  restore(): User {
    return this.copy({ isDeleted: false });
  }

  unban(): User {
    return this.copy({ isBanned: false });
  }

  updateAvatar(avatar: string): User {
    return this.copy({ avatar });
  }

  updateEmail(email: Email): User {
    return this.copy({ email });
  }

  updateNickname(nickname: UserNickname): User {
    return this.copy({ nickname });
  }

  updatePassword(password: Password): User {
    return this.copy({ password });
  }

  updateRole(role: UserRole): User {
    return this.copy({ role });
  }
}
