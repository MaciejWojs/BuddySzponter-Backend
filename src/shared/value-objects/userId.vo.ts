export class UserId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new Error('UserId must be a positive integer');
    }
  }

  get value(): number {
    return this.id;
  }
}
