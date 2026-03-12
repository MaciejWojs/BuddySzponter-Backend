import { BaseError } from '../BaseError';

export abstract class InfrastructureError extends BaseError {
  constructor(message: string) {
    super(message, 502);
  }

  abstract override formatError(): string;
}
