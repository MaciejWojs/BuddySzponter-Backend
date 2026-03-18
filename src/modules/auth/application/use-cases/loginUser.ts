import { IUserRepository } from '@/modules/users/domain/repositories/IUserRepository';
import { User } from '@/modules/users/domain/entities/User.entity';
import { Email } from '@/modules/users/domain/value-objects';

import { LoginInput } from '../../api/schemas/auth.requests.schema';

export class LoginUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<User> {
    const email = new Email(input.email);

    let user: User;
    try {
      user = await this.userRepository.findByEmail(email);
    } catch {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.password.verify(input.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}
