import logger from '@/infrastucture/logger';
import { Device } from '@/modules/devices/domain/entities/Device.entity';
import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import {
  DeviceFingerprint,
  DeviceName,
  DeviceOS,
} from '@/modules/devices/domain/value-objects';
import { DeviceUUID, UserId } from '@/shared/value-objects';

export class CreateUserDevice {
  constructor(private readonly deviceRepository: IDevicesRepository) {}
  async execute(
    fingerprint: string,
    userId: number,
    deviceName: string = 'Unknown Device',
    deviceOs: string = 'Unknown OS',
  ): Promise<Device> {
    const fingerprintVO = new DeviceFingerprint(fingerprint);

    const existingDevices =
      await this.deviceRepository.findByFingerprint(fingerprintVO);
    if (existingDevices.length > 0) {
      try {
        if (!existingDevices[0]!.userId) {
          existingDevices[0] = existingDevices[0]!.changeUser(
            new UserId(userId),
          );
          await this.deviceRepository.save(existingDevices[0]!);
        }
      } catch (error) {
        logger.error(`Failed to assign device to user ${userId}: ${error}`);
        throw new Error('Device is already assigned to another user', {
          cause: error,
        });
      }
      return existingDevices[0]!;
    }

    const userIdVO = new UserId(userId);
    const deviceNameVO = new DeviceName(deviceName);
    const deviceOsVO = new DeviceOS(deviceOs);

    const newDevice = await this.deviceRepository.create(
      new Device(
        new DeviceUUID(),
        userIdVO,
        fingerprintVO,
        deviceNameVO,
        deviceOsVO,
        new Date(),
      ),
    );
    return newDevice;
  }
}
