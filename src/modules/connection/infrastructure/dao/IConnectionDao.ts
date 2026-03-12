import { connectionSessionsTable } from '@infra/db/schema';

export type ConnectionDbRecord = typeof connectionSessionsTable.$inferSelect;

export type CreateConnection = Omit<ConnectionDbRecord, 'id' | 'createdAt'>;

export interface IConnectionDAO {
  findById(id: number): Promise<ConnectionDbRecord | null>;
  findByGuestId(guestId: number): Promise<ConnectionDbRecord[]>;
  findByHostId(hostId: number): Promise<ConnectionDbRecord[]>;
  findByGuestDeviceId(deviceId: number): Promise<ConnectionDbRecord[]>;
  findByHostDeviceId(deviceId: number): Promise<ConnectionDbRecord[]>;
  create(data: CreateConnection): Promise<ConnectionDbRecord | null>;
  deleteById(id: number): Promise<boolean>;
  save(record: ConnectionDbRecord): Promise<ConnectionDbRecord>;
}
