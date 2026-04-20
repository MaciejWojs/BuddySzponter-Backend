import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import { UserId } from '@/shared/value-objects';

import { GetUserDeviceResponse } from '../../api/schemas/user.response.schema';

export class GetUserDevices {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(userId: number): Promise<GetUserDeviceResponse[]> {
    const devices = await this.devicesRepository.findByUserId(
      new UserId(userId)
    );

    return devices.map((device) => ({
      id: device.id.value,
      userId,
      fingerprint: device.fingerprint.value,
      name: device.name.value,
      os: device.os.value,
      lastUsedAt: device.lastUsedAt,
      createdAt: device.createdAt
    }));
  }
}
