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
    fingerprint: string,
    userId: number | null,
    deviceName: string = 'Unknown Device',
    deviceOs: string = 'Unknown OS',
  ): Promise<Device> {
    if (userId) {
      const createUserDevice = new CreateUserDevice(this.deviceRepository);
      return await createUserDevice.execute(
        fingerprint,
        userId,
        deviceName,
        deviceOs,
      );
    }
    const fingerprintVO = new DeviceFingerprint(fingerprint);

    const existingDevices =
      await this.deviceRepository.findByFingerprint(fingerprintVO);
    if (existingDevices.length > 0) {
      const unassignedDevice = existingDevices.find((device) => !device.userId);
      if (unassignedDevice) {
        return unassignedDevice;
      }
    }
    const deviceNameVO = new DeviceName(deviceName);
    const deviceOsVO = new DeviceOS(deviceOs);

    const newDevice = await this.deviceRepository.create(
      new Device(
        new DeviceUUID(),
        null,
        fingerprintVO,
        deviceNameVO,
        deviceOsVO,
        new Date(),
      ),
    );
    return newDevice;
  }
}
