import { connectionSessionsTable } from '@infra/db/schema';

export type SessionDbRecord = typeof connectionSessionsTable.$inferSelect;

export type CreateSession = Omit<SessionDbRecord, 'id' | 'createdAt'>;

export interface ISessionDAO {
  findById(id: number): Promise<SessionDbRecord | null>;
  findByGuestId(userId: number): Promise<SessionDbRecord[]>;
  findByHostId(userId: number): Promise<SessionDbRecord[]>;
  findByStatus(status: string): Promise<SessionDbRecord[]>;
  findActiveByUserId(userId: number): Promise<SessionDbRecord[]>;
  findByGuestDeviceId(deviceId: number): Promise<SessionDbRecord[]>;
  findByHostDeviceId(deviceId: number): Promise<SessionDbRecord[]>;
  create(data: CreateSession): Promise<SessionDbRecord | null>;
  deleteById(id: number): Promise<boolean>;
  save(record: SessionDbRecord): Promise<SessionDbRecord>;
}
