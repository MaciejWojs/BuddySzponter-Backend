export class DeviceId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new Error('DeviceId must be a positive integer');
    }
  }

  get value(): number {
    return this.id;
  }
}
