import { validate } from 'email-validator';
export class Email {
  private readonly email: string;

  constructor(email: string) {
    if (!validate(email)) {
      throw new Error('Invalid email format');
    }
    this.email = email.toLowerCase();
  }

  get value(): string {
    return this.email;
  }
}
