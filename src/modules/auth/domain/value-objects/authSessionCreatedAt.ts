export class authSessionCreatedAt {
  constructor(private createdAt: Date) {}

  getValue(): Date {
    return this.createdAt;
  }
}
