import { GetUserResponse } from '../../api/schemas/user.response.schema';
import {
  FindUsersFilters,
  IUserRepository,
} from '../../domain/repositories/IUserRepository';

export class GetUsers {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: FindUsersFilters): Promise<GetUserResponse[]> {
    const hasFilters =
      input.nickname !== undefined ||
      input.email !== undefined ||
      input.role !== undefined ||
      input.isBanned !== undefined ||
      input.isDeleted !== undefined;

    const users = hasFilters
      ? await this.userRepository.findManyFiltered(input)
      : await this.userRepository.findMany(input.offset, input.limit);

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
