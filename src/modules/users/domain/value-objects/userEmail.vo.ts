import { validate } from 'email-validator';
import { InvalidEmailAddress } from '../errors/InvalidEmailAddress';
export class Email {
  private readonly email: string;

  constructor(email: string) {
    if (!validate(email)) {
      throw new InvalidEmailAddress(email);
    }
    this.email = email.toLowerCase();
  }

  get value(): string {
    return this.email;
  }
}
