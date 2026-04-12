import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import { DeviceUUID, UserId } from '@/shared/value-objects';

export class DeleteUserDevice {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(userId: number, deviceId: string): Promise<void> {
    const userIdVO = new UserId(userId);
    const deviceIdVO = new DeviceUUID(deviceId);

    const device = await this.devicesRepository.findById(deviceIdVO);
    if (!device || !device.userId || device.userId.value !== userIdVO.value) {
      throw new Error('Device not found');
    }

    const deleted = await this.devicesRepository.deleteById(deviceIdVO);
    if (!deleted) {
      throw new Error('Device not found');
    }
  }
}
