import { ApplicationError } from '../Base/ApplicationError';

export class ForbiddenError extends ApplicationError {
  constructor(message: string) {
    // Using default code 500, as it's an application-level error
    super(message);
  }

  override formatError(): string {
    return `[Forbidden Error - ${this.code}]: ${this.message}`;
  }
}
