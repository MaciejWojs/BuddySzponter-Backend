export class UserNickname {
  constructor(private nickname: string) {
    if (nickname.trim().length === 0) {
      throw new Error('UserNickname cannot be empty');
    }
  }

  get value(): string {
    return this.nickname;
  }
}
