export class ConnectionId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new Error('ConnectionId must be a positive integer');
    }
  }

  get value(): number {
    return this.id;
  }
}
