import { GetUserResponse } from '../../api/schemas/user.response.schema';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

type Input = {
  offset: number;
  limit: number;
  search?: string;
  role?: string;
  isBanned?: boolean;
  isDeleted?: boolean;
};

export class GetUsersFiltered {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: Input): Promise<GetUserResponse[]> {
    const users = await this.userRepository.findManyFiltered(input);

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
