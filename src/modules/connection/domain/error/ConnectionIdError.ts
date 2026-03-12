import { BaseIdError } from '@/shared/errors/Domian/BaseIdError';

export class ConnectionIdError extends BaseIdError {
  constructor(id: number) {
    super(id, 'Connection');
  }
}
