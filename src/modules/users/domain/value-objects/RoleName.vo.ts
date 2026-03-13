export class RoleName {
  constructor(readonly name: string) {
    if (!name || name.trim() === '') {
      throw new Error('Role name cannot be empty');
    }
    if (name.length > 50) {
      throw new Error('Role name cannot exceed 50 characters');
    }
    this.name = this.name.toUpperCase();
  }
  get value(): string {
    return this.name;
  }
}
