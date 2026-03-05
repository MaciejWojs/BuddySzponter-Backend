export class AuthSessionUserId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new Error('AuthSessionUserId must be a positive integer');
    }
  }

  getValue(): number {
    return this.id;
  }
}
