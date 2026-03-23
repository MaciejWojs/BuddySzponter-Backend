export class Version {
  constructor(private readonly version: string) {
    const trimmed = version.trim();
    if (trimmed.length === 0) {
      throw new Error('Version cannot be empty');
    }
    if (/\s/.test(trimmed)) {
      throw new Error('Version cannot contain whitespace');
    }

    if (!/^\d+\.\d+\.\d+$/.test(trimmed)) {
      throw new Error('Invalid version format. Expected x.y.z');
    }
    this.version = trimmed;
  }

  get value(): string {
    return this.version;
  }
}
