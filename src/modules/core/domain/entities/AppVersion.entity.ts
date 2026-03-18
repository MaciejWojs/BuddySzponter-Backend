export class AppVersion {
  constructor(
    public readonly id: number,
    public readonly version: string,
    public readonly codename: string | null,
    public readonly isSupported: boolean,
  ) {}
}
