import { DomainError } from '../Base/DomainError';

export class ConflictError extends DomainError {
  constructor(message: string) {
    // Using default code 409 - Conflict
    super(message, 409);
  }

  override formatError(): string {
    return `[Conflict Error - ${this.code}]: ${this.message}`;
  }
}
