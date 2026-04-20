import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';

import { GetDevicesQuery } from '../../api/schemas/devices.request.schema';
import { DeviceResponse } from '../../api/schemas/devices.response.schema';

export class GetDevices {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(query: GetDevicesQuery): Promise<DeviceResponse[]> {
    const devices = await this.devicesRepository.findMany(
      query.offset,
      query.limit
    );

    return devices.map((device) => ({
      id: device.id.value,
      userId: device.userId?.value ?? null,
      fingerprint: device.fingerprint.value,
      name: device.name.value,
      os: device.os.value,
      lastUsedAt: device.lastUsedAt,
      createdAt: device.createdAt
    }));
  }
}
