import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import { UserId } from '@/shared/value-objects';

export class DeleteUserDevices {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(userId: number): Promise<number> {
    const userDevices = await this.devicesRepository.findByUserId(
      new UserId(userId),
    );

    for (const device of userDevices) {
      const deleted = await this.devicesRepository.deleteById(device.id);
      if (!deleted) {
        throw new Error(`Failed to delete device ${device.id.value}`);
      }
    }

    return userDevices.length;
  }
}
