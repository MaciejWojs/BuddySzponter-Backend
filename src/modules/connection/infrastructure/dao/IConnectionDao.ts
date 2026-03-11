import { connectionSessionsTable } from '@infra/db/schema';

export type ConnectionDbRecord = typeof connectionSessionsTable.$inferSelect;

export type CreateConnection = Omit<ConnectionDbRecord, 'id' | 'createdAt'>;

export interface IConnectionDAO {
  findById(id: number): Promise<ConnectionDbRecord | null>;
  findByGuestId(userId: number): Promise<ConnectionDbRecord[]>;
  findByHostId(userId: number): Promise<ConnectionDbRecord[]>;
  findByStatus(status: string): Promise<ConnectionDbRecord[]>;
  findActiveByUserId(userId: number): Promise<ConnectionDbRecord[]>;
  findByGuestDeviceId(deviceId: number): Promise<ConnectionDbRecord[]>;
  findByHostDeviceId(deviceId: number): Promise<ConnectionDbRecord[]>;
  create(data: CreateConnection): Promise<ConnectionDbRecord | null>;
  deleteById(id: number): Promise<boolean>;
  save(record: ConnectionDbRecord): Promise<ConnectionDbRecord>;
}
