import { Device } from '@/modules/devices/domain/entities/Device.entity';
import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import { DeviceFingerprint } from '@/modules/devices/domain/value-objects';
import { DeviceName } from '@/modules/devices/domain/value-objects/DeviceName.vo';
import { DeviceOS } from '@/modules/devices/domain/value-objects/DeviceOS.vo';
import { DeviceUUID } from '@/shared/value-objects';

import { CreateUserDevice } from '../../../users/application/use-case/createUserDevice';

export class FindOrCreateDevice {
  constructor(private readonly deviceRepository: IDevicesRepository) {}

  async execute(
    deviceId: string,
    userId: number | null,
    deviceName: string = 'Unknown Device',
    deviceOs: string = 'Unknown OS',
    fingerprint?: string
  ): Promise<Device> {
    if (userId) {
      const createUserDevice = new CreateUserDevice(this.deviceRepository);
      return await createUserDevice.execute(
        deviceId,
        userId,
        deviceName,
        deviceOs,
        fingerprint
      );
    }

    const deviceIdVO = new DeviceUUID(deviceId);
    const existingById = await this.deviceRepository.findById(deviceIdVO);
    if (existingById && !existingById.userId) {
      return this.deviceRepository.save(existingById.markAsUsed());
    }

    const fingerprintVO = new DeviceFingerprint(
      fingerprint?.trim() || deviceId
    );

    const existingDevices =
      await this.deviceRepository.findByFingerprint(fingerprintVO);
    if (existingDevices.length > 0) {
      const unassignedDevice = existingDevices.find((device) => !device.userId);
      if (unassignedDevice) {
        return this.deviceRepository.save(unassignedDevice.markAsUsed());
      }
    }
    const deviceNameVO = new DeviceName(deviceName);
    const deviceOsVO = new DeviceOS(deviceOs);

    const newDevice = await this.deviceRepository.create(
      new Device(
        deviceIdVO,
        null,
        fingerprintVO,
        deviceNameVO,
        deviceOsVO,
        new Date(),
        new Date()
      )
    );
    return newDevice;
  }
}
