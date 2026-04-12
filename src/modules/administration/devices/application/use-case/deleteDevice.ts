import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import { DeviceUUID } from '@/shared/value-objects';

export class DeleteDevice {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(deviceId: string): Promise<void> {
    const deleted = await this.devicesRepository.deleteById(
      new DeviceUUID(deviceId)
    );

    if (!deleted) {
      throw new Error('Device not found');
    }
  }
}
