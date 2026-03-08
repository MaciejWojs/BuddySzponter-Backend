export class DeviceFingerprint {
  private readonly fingerprint: string;

  constructor(fingerprint: string) {
    if (!fingerprint || fingerprint.trim() === '') {
      throw new Error('Device fingerprint cannot be empty');
    }
    this.fingerprint = fingerprint;
  }

  get value(): string {
    return this.fingerprint;
  }
}
