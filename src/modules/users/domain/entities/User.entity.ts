import { UserId } from '@/shared/value-objects';

import { Email, Password, UserNickname } from '../value-objects';
export class User {
  constructor(
    readonly id: UserId,
    readonly email: Email,
    readonly nickname: UserNickname,
    readonly password: Password,
    readonly isBanned: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
  private copy(changes: Partial<User>): User {
    return new User(
      changes.id ?? this.id,
      changes.email ?? this.email,
      changes.nickname ?? this.nickname,
      changes.password ?? this.password,
      changes.isBanned ?? this.isBanned,
      changes.createdAt ?? this.createdAt,
      new Date(),
    );
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
  ban(): User {
    return this.copy({ isBanned: true });
  }
  unban(): User {
    return this.copy({ isBanned: false });
  }
}
