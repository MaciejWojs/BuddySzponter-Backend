import { DomainError } from '../Base/DomainError';

export class ValidationError extends DomainError {
  constructor(message: string) {
    // Using default code 400, as it's a domain-level error
    super(message);
  }

  override formatError(): string {
    return `[Validation Error - ${this.code}]: ${this.message}`;
  }
}
