// modules/auth/application/use-cases/registerUser.ts
import { RegisterInput } from '@modules/auth/api/schemas/auth.requests.schema';
import { User } from '@modules/users/domain/entities/User.entity';
import { IUserRepository } from '@modules/users/domain/repositories/IUserRepository';
import { Email } from '@modules/users/domain/value-objects/userEmail.vo';
import { UserNickname } from '@modules/users/domain/value-objects/userNickname.vo';
import { Password } from '@modules/users/domain/value-objects/userPassword.vo';

import { ValidationError } from '@/shared/errors/Specialized/ValidationError';

export class RegisterUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<User> {
    if (input.password !== input.passwordConfirm) {
      throw new Error('Passwords do not match');
    }

    const password = await Password.create(input.password);

    const user = new User(
      null,
      new Email(input.email),
      new UserNickname(input.nickname),
      password,
      false,
      false,
      new Date(),
      new Date(),
    );

    let savedUser: User;
    try {
      savedUser = await this.userRepository.createUser(user);
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }

      if (err instanceof Error && err.message.includes('already exists')) {
        throw new Error('User with this email already exists', { cause: err });
      }
      //   if (err instanceof UserAlreadyExistsError) {
      //     throw err;
      //   }
      //TODO: Handle specific errors like user already exists, validation errors, etc. When we have our custom error classes defined.
      throw new Error('Failed to register user', { cause: err });
    }

    //TODO: Emit user registered event which will trigger cache update and other side effects

    return savedUser;
  }
}
