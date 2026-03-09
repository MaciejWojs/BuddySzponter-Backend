export class DeviceType {
  private readonly deviceType: string;

  constructor(deviceType: string) {
    if (!deviceType || deviceType.trim() === '') {
      throw new Error('Device type cannot be empty');
    }
    this.deviceType = deviceType;
  }

  get value(): string {
    return this.deviceType;
  }
}
