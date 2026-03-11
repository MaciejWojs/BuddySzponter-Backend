import { BaseIdError } from "@/shared/errors/Domian/BaseIdError";

export class DeviceIdError extends BaseIdError {
  constructor(id: number) {
    super(id, 'Device');
  }
}