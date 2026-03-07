export class AuthSessionId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new Error('AuthSessionId must be a positive integer');
    }
  }

  getValue(): number {
    return this.id;
  }
}
