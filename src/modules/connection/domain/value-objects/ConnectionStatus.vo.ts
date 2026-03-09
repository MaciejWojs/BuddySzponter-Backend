export class ConnectionStatus {
  constructor(private status: string) {
    if (status.trim().length === 0) {
      throw new Error('ConnectionStatus cannot be empty');
    }
  }

  get value(): string {
    return this.status;
  }
}
