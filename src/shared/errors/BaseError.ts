export abstract class BaseError extends Error {
  public code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  abstract formatError(): string;

  override toString(): string {
    return this.formatError();
  }
}
