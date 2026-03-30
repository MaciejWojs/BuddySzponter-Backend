import { IDevicesRepository } from '@/modules/devices/domain/repositories/IDeviceRepository';

export class GetDevicesTotal {
  constructor(private readonly devicesRepository: IDevicesRepository) {}

  async execute(): Promise<number> {
    return this.devicesRepository.countAll();
  }
}
