import { UserId } from '@/shared/value-objects';

import { PatchUserInput } from '../../api/schemas/users.request.schema';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email, Password, UserNickname } from '../../domain/value-objects';
import { RoleId } from '../../domain/value-objects/RoleId.vo';
import { RoleName } from '../../domain/value-objects/RoleName.vo';
import { UserRole } from '../../domain/value-objects/userRole.vo';

type IRoleReader = {
  findById(id: number): Promise<{ id: number; name: string } | null>;
};

export class UpdateUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleReader?: IRoleReader
  ) {}

  async execute(
    requesterId: number,
    targetUserId: number,
    input: PatchUserInput
  ): Promise<void> {
    const requester = await this.userRepository.findById(
      new UserId(requesterId)
    );
    let user = await this.userRepository.findById(new UserId(targetUserId));

    if (!requester.canEditUser(user)) {
      throw new Error('Forbidden');
    }

    let hasChanges = false;

    if (input.email !== undefined && input.email !== user.email.value) {
      user = user.updateEmail(new Email(input.email));
      hasChanges = true;
    }

    if (
      input.nickname !== undefined &&
      input.nickname !== user.nickname.value
    ) {
      user = user.updateNickname(new UserNickname(input.nickname));
      hasChanges = true;
    }

    if (input.password !== undefined) {
      const hashed = await Password.create(input.password);
      user = user.updatePassword(hashed);
      hasChanges = true;
    }

    const triedAdminOnlyFields =
      input.isBanned !== undefined ||
      input.isDeleted !== undefined ||
      input.roleId !== undefined;

    if (!requester.canEditAdminFields() && triedAdminOnlyFields) {
      throw new Error('Forbidden fields for self update');
    }

    if (requester.canEditAdminFields()) {
      if (
        typeof input.isBanned === 'boolean' &&
        input.isBanned !== user.isBanned
      ) {
        user = input.isBanned ? user.ban() : user.unban();
        hasChanges = true;
      }

      if (
        typeof input.isDeleted === 'boolean' &&
        input.isDeleted !== user.isDeleted
      ) {
        user = input.isDeleted ? user.delete() : user.restore();
        hasChanges = true;
      }

      if (typeof input.roleId === 'number' && input.roleId !== user.role.id) {
        if (requester.id && user.id && requester.id.value === user.id.value) {
          throw new Error('Cannot change own role');
        }

        if (!this.roleReader) {
          throw new Error('Role lookup is not configured');
        }

        const role = await this.roleReader.findById(input.roleId);
        if (!role) {
          throw new Error('Role not found');
        }

        user = user.updateRole(
          new UserRole(new RoleId(role.id), new RoleName(role.name))
        );
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      throw new Error('No changes detected');
    }

    await this.userRepository.updateUser(user);
  }
}
