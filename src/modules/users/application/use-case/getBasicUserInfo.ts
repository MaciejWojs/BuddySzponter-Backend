import { MePayload } from '@/modules/auth/api/schemas/auth.responses.schema';
import { UserId } from '@/shared/value-objects';

import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class GetBasicUserInfo {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number): Promise<MePayload> {
    const uID = new UserId(userId);
    const user = await this.userRepository.findById(uID);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.id) {
      throw new Error('User not found');
    }
    const final: MePayload = {
      id: user.id.value,
      avatar: user.avatar,
      email: user.email.value,
      nickname: user.nickname.value,
      createdAt: user.createdAt
    };
    return final;
  }
}
