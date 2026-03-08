export class DeviceName {
  private readonly name: string;

  constructor(name: string) {
    if (!name || name.trim() === '') {
      throw new Error('Device name cannot be empty');
    }
    this.name = name;
  }

  get value(): string {
    return this.name;
  }
}
