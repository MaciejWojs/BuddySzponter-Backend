import { BaseUUID } from '@/shared/value-objects/BaseUUID.vo';

export class AppVersionUUID extends BaseUUID {
  constructor(value?: string) {
    super(value);
  }
}
