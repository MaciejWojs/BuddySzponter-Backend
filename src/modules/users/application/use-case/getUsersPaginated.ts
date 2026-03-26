import { GetUserResponse } from '../../api/schemas/user.response.schema';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class GetUsersPaginated {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(offset: number, limit: number): Promise<GetUserResponse[]> {
    const users = await this.userRepository.findMany(offset, limit);

    return users
      .filter((u) => u.id !== null)
      .map((user) => ({
        id: user.id!.value,
        roleId: user.role.id,
        email: user.email.value,
        nickname: user.nickname.value,
        avatar: user.avatar,
        isBanned: user.isBanned,
        isDeleted: user.isDeleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
  }
}
