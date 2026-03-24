import { UserId } from '@/shared/value-objects';

import { GetUserResponse } from '../../api/schemas/user.response.schema';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class GetAdminUserProfile {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number): Promise<GetUserResponse> {
    const uID = new UserId(userId);
    const user = await this.userRepository.findById(uID);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.id) {
      throw new Error('User not found');
    }
    const final: GetUserResponse = {
      id: user.id.value,
      roleId: user.role.id,
      email: user.email.value,
      nickname: user.nickname.value,
      avatar: user.avatar,
      isBanned: user.isBanned,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return final;
  }
}
