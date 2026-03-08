export class UserNickname {
  constructor(private nickname: string) {
    if (nickname.trim().length === 0) {
      throw new Error('UserNickname cannot be empty');
    }
  }

  getValue(): string {
    return this.nickname;
  }
}
