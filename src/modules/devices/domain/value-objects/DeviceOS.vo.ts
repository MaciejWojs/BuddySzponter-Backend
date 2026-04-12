export class DeviceOS {
  private readonly os: string;

  constructor(os: string) {
    if (!os || os.trim() === '') {
      throw new Error('Device OS cannot be empty');
    }
    this.os = os;
  }

  get value(): string {
    return this.os;
  }
}
