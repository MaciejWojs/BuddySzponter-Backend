import { UserNicknameEmptyError } from '../errors/UserNicknameEmptyError';

export class UserNickname {
  constructor(private nickname: string) {
    if (nickname.trim().length === 0) {
      throw new UserNicknameEmptyError();
    }
    if (nickname.length > 100) {
      throw new Error('Nickname cannot exceed 100 characters');
    }
    if (/\s/.test(nickname)) {
      throw new Error('Nickname cannot contain whitespace');
    }
    if (nickname.length < 3) {
      throw new Error('Nickname must be at least 3 characters long');
    }
  }

  get value(): string {
    return this.nickname;
  }
}
