import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import { UserId } from '@/shared/value-objects';

export class DeleteUserDevices {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(userId: number): Promise<number> {
    const userDevices = await this.devicesRepository.findByUserId(
      new UserId(userId)
    );

    await Promise.all(
      userDevices.map((device) => this.devicesRepository.deleteById(device.id))
    );

    return userDevices.length;
  }
}
