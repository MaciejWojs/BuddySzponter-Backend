import logger from '@/infrastucture/logger';
import { Device } from '@/modules/devices/domain/entities/Device.entity';
import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';
import {
  DeviceFingerprint,
  DeviceName,
  DeviceOS
} from '@/modules/devices/domain/value-objects';
import { DeviceUUID, UserId } from '@/shared/value-objects';
import { IpAddress } from '@/shared/value-objects/IpAddress.vo';

export class CreateUserDevice {
  constructor(private readonly deviceRepository: IDevicesRepository) {}

  private applyMetadata(
    device: Device,
    name?: string,
    os?: string,
    ipAddress?: string | IpAddress
  ): Device {
    let updated = device.markAsUsed();

    const normalizedName = name?.trim();
    if (normalizedName) {
      updated = updated.updateName(new DeviceName(normalizedName));
    }

    const normalizedOs = os?.trim();
    if (normalizedOs) {
      updated = updated.updateOs(new DeviceOS(normalizedOs));
    }

    const normalizedIpAddress = this.normalizeIpAddress(ipAddress)?.trim();
    if (normalizedIpAddress) {
      updated = updated.updateLastIpAddress(normalizedIpAddress);
    }

    return updated;
  }

  private async createNewDevice(
    userId: UserId,
    fingerprint: DeviceFingerprint,
    deviceName?: string,
    deviceOs?: string,
    ipAddress?: string | IpAddress,
    deviceId: DeviceUUID = new DeviceUUID()
  ): Promise<Device> {
    const deviceNameVO = new DeviceName(deviceName?.trim() || 'Unknown Device');
    const deviceOsVO = new DeviceOS(deviceOs?.trim() || 'Unknown OS');
    const normalizedIpAddress =
      this.normalizeIpAddress(ipAddress)?.trim() || null;

    return await this.deviceRepository.create(
      new Device(
        deviceId,
        userId,
        fingerprint,
        deviceNameVO,
        deviceOsVO,
        new Date(),
        new Date(),
        normalizedIpAddress
      )
    );
  }

  async execute(
    deviceId: string | undefined,
    userId: number,
    deviceName?: string,
    deviceOs?: string,
    fingerprint?: string,
    ipAddress?: string | IpAddress
  ): Promise<Device> {
    const normalizedFingerprint = fingerprint?.trim();
    if (!normalizedFingerprint) {
      throw new Error('Device fingerprint is required');
    }

    const fingerprintVO = new DeviceFingerprint(normalizedFingerprint);
    const userIdVO = new UserId(userId);

    if (deviceId) {
      const deviceIdVO = new DeviceUUID(deviceId);
      const existingDevice = await this.deviceRepository.findById(deviceIdVO);

      if (existingDevice) {
        if (existingDevice.userId?.value === userId) {
          return this.saveWithLatestMetadata(
            existingDevice,
            deviceName,
            deviceOs,
            ipAddress
          );
        }

        if (!existingDevice.userId) {
          try {
            const assignedDevice = this.applyMetadata(
              existingDevice.changeUser(userIdVO),
              deviceName,
              deviceOs,
              ipAddress
            );
            await this.deviceRepository.save(assignedDevice);
            return assignedDevice;
          } catch (error) {
            logger.error(
              `Failed to assign existing device ${deviceId} to user ${userId}: ${error}`
            );
            throw new Error('Failed to assign unbound device to user', {
              cause: error
            });
          }
        }

        logger.warn(
          `Device ${deviceId} is linked to another user. Creating a new device for user ${userId}.`
        );

        const existingDevices =
          await this.deviceRepository.findByFingerprint(fingerprintVO);
        const sameUserDevice = existingDevices.find(
          (device) => device.userId?.value === userId
        );

        if (sameUserDevice) {
          return this.saveWithLatestMetadata(
            sameUserDevice,
            deviceName,
            deviceOs,
            ipAddress
          );
        }

        return this.createNewDevice(
          userIdVO,
          fingerprintVO,
          deviceName,
          deviceOs,
          ipAddress
        );
      }

      return this.createNewDevice(
        userIdVO,
        fingerprintVO,
        deviceName,
        deviceOs,
        ipAddress,
        deviceIdVO
      );
    }

    const existingDevices =
      await this.deviceRepository.findByFingerprint(fingerprintVO);
    if (existingDevices.length > 0) {
      const sameUserDevice = existingDevices.find(
        (device) => device.userId?.value === userId
      );

      if (sameUserDevice) {
        return this.saveWithLatestMetadata(
          sameUserDevice,
          deviceName,
          deviceOs,
          ipAddress
        );
      }

      const unassignedDevice = existingDevices.find((device) => !device.userId);

      if (unassignedDevice) {
        try {
          const assignedDevice = this.applyMetadata(
            unassignedDevice.changeUser(userIdVO),
            deviceName,
            deviceOs,
            ipAddress
          );
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

    return this.createNewDevice(
      userIdVO,
      fingerprintVO,
      deviceName,
      deviceOs,
      ipAddress
    );
  }

  private normalizeIpAddress(
    ipAddress?: string | IpAddress
  ): string | undefined {
    if (!ipAddress) {
      return undefined;
    }

    return ipAddress instanceof IpAddress ? ipAddress.value : ipAddress;
  }

  private async saveWithLatestMetadata(
    device: Device,
    name?: string,
    os?: string,
    ipAddress?: string | IpAddress
  ): Promise<Device> {
    return this.deviceRepository.save(
      this.applyMetadata(device, name, os, ipAddress)
    );
  }
}
