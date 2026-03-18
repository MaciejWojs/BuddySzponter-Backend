import { DeviceUUID, UserId } from "@/shared/value-objects";
import { Device } from "../entities/Device.entity";
import { DeviceFingerprint } from "../value-objects";

export interface IDevicesRepository {
    findById(id: DeviceUUID): Promise<Device | null>;
    create(device: Device): Promise<Device>;
    deleteById(id: DeviceUUID): Promise<boolean>;
    save(device: Device): Promise<Device>;

    findByFingerprint(fingerprint: DeviceFingerprint): Promise<Device[]>;
    findByUserId(userId: UserId): Promise<Device[]>;
}
