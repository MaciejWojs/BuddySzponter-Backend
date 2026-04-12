import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import { DeviceName, DeviceOS } from '@/modules/devices/domain/value-objects';
import { DeviceUUID, UserId } from '@/shared/value-objects';

import { PatchDeviceInput } from '../../api/schemas/devices.request.schema';

export class UpdateDevice {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(deviceId: string, input: PatchDeviceInput): Promise<void> {
    let device = await this.devicesRepository.findById(
      new DeviceUUID(deviceId)
    );

    if (!device) {
      throw new Error('Device not found');
    }

    let hasChanges = false;

    if (input.name !== undefined && input.name !== device.name.value) {
      device = device.updateName(new DeviceName(input.name));
      hasChanges = true;
    }

    if (input.os !== undefined && input.os !== device.os.value) {
      device = device.updateOs(new DeviceOS(input.os));
      hasChanges = true;
    }

    if (input.userId !== undefined) {
      const nextUserId =
        input.userId === null ? null : new UserId(input.userId);
      const currentUserId = device.userId?.value ?? null;
      const desiredUserId = nextUserId?.value ?? null;

      if (currentUserId !== desiredUserId) {
        device = device.updateUser(nextUserId);
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      throw new Error('No changes detected');
    }

    await this.devicesRepository.save(device);
  }
}
