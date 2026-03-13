import { connectionLogsTable } from '@infra/db/schema';

export type ConnectionDbRecord = typeof connectionLogsTable.$inferSelect;

export type CreateConnection = Omit<ConnectionDbRecord, 'id' | 'createdAt'>;

export interface IConnectionDAO {
  findById(id: string): Promise<ConnectionDbRecord | null>;
  findByGuestId(guestId: number): Promise<ConnectionDbRecord[]>;
  findByHostId(hostId: number): Promise<ConnectionDbRecord[]>;
  findByGuestDeviceId(deviceId: string): Promise<ConnectionDbRecord[]>;
  findByHostDeviceId(deviceId: string): Promise<ConnectionDbRecord[]>;
  create(data: CreateConnection): Promise<ConnectionDbRecord | null>;
  deleteById(id: string): Promise<boolean>;
  save(record: ConnectionDbRecord): Promise<ConnectionDbRecord>;
}
