import { DomainError } from '../Base/DomainError';

export class NotFoundError extends DomainError {
  constructor(message: string) {
    // Using default code 404 - Not Found
    super(message, 404);
  }

  override formatError(): string {
    return `[Not Found Error - ${this.code}]: ${this.message}`;
  }
}
