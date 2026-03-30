import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import { DeviceUUID } from '@/shared/value-objects';

import { DeviceResponse } from '../../api/schemas/devices.response.schema';

export class GetDeviceById {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(deviceId: string): Promise<DeviceResponse> {
    const device = await this.devicesRepository.findById(
      new DeviceUUID(deviceId),
    );

    if (!device) {
      throw new Error('Device not found');
    }

    return {
      id: device.id.value,
      userId: device.userId?.value ?? null,
      fingerprint: device.fingerprint.value,
      name: device.name.value,
      os: device.os.value,
      createdAt: device.createdAt,
    };
  }
}
