export class ConnectionCode {
  static readonly LENGTH = 8;

  constructor(private code: string) {
    if (code.trim().length === 0) {
      throw new Error('Connection code cannot be empty');
    }
    if (code.length !== ConnectionCode.LENGTH) {
      throw new Error(
        `Connection code must be ${ConnectionCode.LENGTH} characters long(got ${code.length})`,
      );
    }
  }

  get value(): string {
    return this.code;
  }
}
