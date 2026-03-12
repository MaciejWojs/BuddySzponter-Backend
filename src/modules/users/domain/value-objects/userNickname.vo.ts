import { UserNicknameEmptyError } from '../errors/UserNicknameEmptyError';

export class UserNickname {
  constructor(private nickname: string) {
    if (nickname.trim().length === 0) {
      throw new UserNicknameEmptyError();
    }
  }

  get value(): string {
    return this.nickname;
  }
}
