export class UserFullName {
  constructor(private fullName: string) {
    if (fullName.trim().length === 0) {
      throw new Error('UserFullName cannot be empty');
    }
  }

  getValue(): string {
    return this.fullName;
  }
}
