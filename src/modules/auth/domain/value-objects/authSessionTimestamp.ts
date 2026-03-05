export class AuthSessionTimestamp {
  constructor(private timestamp: Date) {}

  getValue(): Date {
    return this.timestamp;
  }
}
