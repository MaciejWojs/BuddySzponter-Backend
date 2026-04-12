import logger from '@/infrastucture/logger';
import { Device } from '@/modules/devices/domain/entities/Device.entity';
import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import {
  DeviceFingerprint,
  DeviceName,
  DeviceOS
} from '@/modules/devices/domain/value-objects';
import { DeviceUUID, UserId } from '@/shared/value-objects';

export class CreateUserDevice {
  constructor(private readonly deviceRepository: IDevicesRepository) {}

  async execute(
    fingerprint: string,
    userId: number,
    deviceName: string = 'Unknown Device',
    deviceOs: string = 'Unknown OS'
  ): Promise<Device> {
    const fingerprintVO = new DeviceFingerprint(fingerprint);
    const userIdVO = new UserId(userId);

    const existingDevices =
      await this.deviceRepository.findByFingerprint(fingerprintVO);
    if (existingDevices.length > 0) {
      const sameUserDevice = existingDevices.find(
        (device) => device.userId?.value === userId
      );

      if (sameUserDevice) {
        return sameUserDevice;
      }

      const unassignedDevice = existingDevices.find((device) => !device.userId);

      if (unassignedDevice) {
        try {
          const assignedDevice = unassignedDevice.changeUser(userIdVO);
          await this.deviceRepository.save(assignedDevice);
          return assignedDevice;
        } catch (error) {
          logger.error(`Failed to assign device to user ${userId}: ${error}`);
          throw new Error('Failed to assign unbound device to user', {
            cause: error
          });
        }
      }
    }

    const deviceNameVO = new DeviceName(deviceName);
    const deviceOsVO = new DeviceOS(deviceOs);

    const newDevice = await this.deviceRepository.create(
      new Device(
        new DeviceUUID(),
        userIdVO,
        fingerprintVO,
        deviceNameVO,
        deviceOsVO,
        new Date()
      )
    );
    return newDevice;
  }
}
