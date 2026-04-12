import { UserId } from '@/shared/value-objects';

import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class DeleteUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number): Promise<void> {
    await this.userRepository.deleteUser(new UserId(userId));
  }
}
