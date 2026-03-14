import { BaseUUID } from '@/shared/value-objects/BaseUUID.vo';

export class AuthSessionUUID extends BaseUUID {
  constructor(id?: string) {
    super(id);
  }
}
