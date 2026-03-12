import { DeviceIdError } from "@/modules/devices/domain/errors/DeviceIdError";

export class DeviceId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new DeviceIdError(id);
    }
  }

  get value(): number {
    return this.id;
  }
}
