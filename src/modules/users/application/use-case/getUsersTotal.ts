import {
  FindUsersFilters,
  IUserRepository,
} from '../../domain/repositories/IUserRepository';

type TotalInput = Omit<FindUsersFilters, 'offset' | 'limit'>;

export class GetUsersTotal {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: TotalInput): Promise<number> {
    const hasFilters =
      input.nickname !== undefined ||
      input.email !== undefined ||
      input.role !== undefined ||
      input.isBanned !== undefined ||
      input.isDeleted !== undefined;

    if (hasFilters) {
      return this.userRepository.countFiltered({
        offset: 0,
        limit: 1,
        ...input,
      });
    }

    return this.userRepository.countAll();
  }
}
