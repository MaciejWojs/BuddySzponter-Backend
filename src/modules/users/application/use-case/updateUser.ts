import { UserId } from '@/shared/value-objects';

import { PatchUserInput } from '../../api/schemas/user.request.schema';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email, Password, UserNickname } from '../../domain/value-objects';

export class UpdateUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number, input: PatchUserInput): Promise<void> {
    let user = await this.userRepository.findById(new UserId(userId));

    if (input.email) {
      user = user.updateEmail(new Email(input.email));
    }
    if (input.nickname) {
      user = user.updateNickname(new UserNickname(input.nickname));
    }
    if (input.password) {
      const hashed = await Password.create(input.password);
      user = user.updatePassword(hashed);
    }
    if (typeof input.isBanned === 'boolean') {
      user = input.isBanned ? user.ban() : user.unban();
    }
    if (typeof input.isDeleted === 'boolean') {
      user = input.isDeleted ? user.delete() : user.restore();
    }

    await this.userRepository.updateUser(user);
  }
}
