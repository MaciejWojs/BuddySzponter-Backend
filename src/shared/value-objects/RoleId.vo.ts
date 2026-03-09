export class RoleId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new Error('RoleId must be a positive integer');
    }
  }

  get value(): number {
    return this.id;
  }
}
