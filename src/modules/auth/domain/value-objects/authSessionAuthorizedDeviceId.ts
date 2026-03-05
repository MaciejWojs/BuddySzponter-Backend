export class AuthSessionAuthorizedDeviceId {
  constructor(private id: number) {}

  getValue(): number {
    return this.id;
  }
}
