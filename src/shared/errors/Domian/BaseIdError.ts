import { ValidationError } from '../Specialized/ValidationError';

export class BaseIdError extends ValidationError {
  constructor(id: number, entityName: string = '') {
    super(`Invalid ${entityName} ID: ${id}`);
    this.name = this.constructor.name;
  }

  override formatError(): string {
    return `${this.name}: ${this.message}`;
  }
}
