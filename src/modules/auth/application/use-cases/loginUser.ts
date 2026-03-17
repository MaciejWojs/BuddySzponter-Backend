import { IUserRepository } from '@/modules/users/domain/repositories/IUserRepository';
import { Email } from '@/modules/users/domain/value-objects';

import { LoginInput } from '../../api/schemas/auth.requests.schema';

export class LoginUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<void> {
    const email = new Email(input.email);

    const user = await this.userRepository.findByEmail(email);

    const isPasswordValid = await user.password.verify(input.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
  }
}
