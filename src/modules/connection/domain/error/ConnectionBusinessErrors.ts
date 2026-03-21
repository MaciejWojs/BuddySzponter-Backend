import { ValidationError } from '@/shared/errors/Specialized/ValidationError';

export class ConnectionNotFoundError extends ValidationError {
  constructor() {
    super('Connection not found');
  }
}

export class InvalidConnectionPasswordError extends ValidationError {
  constructor() {
    super('Invalid password');
  }
}

export class ConnectionJoinAttemptsExceededError extends ValidationError {
  constructor() {
    super('Maximum join attempts exceeded');
  }
}

export class ConnectionAlreadyOccupiedError extends ValidationError {
  constructor() {
    super('Connection is already occupied by a guest');
  }
}

export class ConnectionNotJoinableError extends ValidationError {
  constructor() {
    super('Connection is not joinable');
  }
}

export class ConnectionCodeAlreadyExistsError extends ValidationError {
  constructor() {
    super('Connection code already exists. Please try again.');
  }
}

export class ConnectionCreateRetriesExceededError extends ValidationError {
  constructor() {
    super('Failed to create connection after max retries');
  }
}
