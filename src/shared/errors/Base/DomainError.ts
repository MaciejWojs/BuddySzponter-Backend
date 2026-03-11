import { BaseError } from '../BaseError';

export abstract class DomainError extends BaseError {
  constructor(message: string, code = 400) {
    super(message, code);
  }

  abstract override formatError(): string;
}
