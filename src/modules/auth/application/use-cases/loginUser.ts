import logger from '@/infrastucture/logger';
import { User } from '@/modules/users/domain/entities/User.entity';
import { IUserRepository } from '@/modules/users/domain/repositories/IUserRepository';
import { Email } from '@/modules/users/domain/value-objects';

import { LoginInput } from '../../api/schemas/auth.requests.schema';

export class LoginUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<User> {
    const email = new Email(input.email);

    const user: User = await this.userRepository.findByEmail(email);

    logger.info(
      `Attempting login for email: ${email.value} - User found: ${!!user} - User ID: ${user?.id?.value || 'N/A'}`,
    );

    const isPasswordValid = await user.password.verify(input.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}
