import { BaseError } from '../BaseError';

export abstract class ApplicationError extends BaseError {
  constructor(message: string) {
    super(message, 500);
  }

  abstract override formatError(): string;
}
