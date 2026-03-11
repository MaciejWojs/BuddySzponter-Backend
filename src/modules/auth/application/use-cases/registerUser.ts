// modules/auth/application/use-cases/registerUser.ts
import { RegisterInput } from '@modules/auth/api/schemas/auth.requests.schema';
import { User } from '@modules/users/domain/entities/User.entity';
import { Email } from '@modules/users/domain/value-objects/userEmail.vo';
import { UserNickname } from '@modules/users/domain/value-objects/userNickname.vo';
import { Password } from '@modules/users/domain/value-objects/userPassword.vo';
import { IUserRepository } from '@modules/users/domain/repositories/IUserRepository';

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
      new Date(),
      new Date(),
    );

    let savedUser: User;
    try {
      savedUser = await this.userRepository.createUser(user);
    } catch {
      //   if (err instanceof UserAlreadyExistsError) {
      //     throw err;
      //   }
      throw new Error('Failed to register user');
    }

    //TODO: Emit user registered event which will trigger cache update and other side effects

    return savedUser;
  }
}
