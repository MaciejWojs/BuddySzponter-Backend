import { authSessionsTable } from '@infra/db/schema';

export type SessionDbRecord = typeof authSessionsTable.$inferSelect;

export type CreateSession = Omit<SessionDbRecord, 'id' | 'createdAt'>;

export interface ISessionDAO {
  findById(id: number): Promise<SessionDbRecord | null>;
  findByUserId(userId: number): Promise<SessionDbRecord[]>;
  findByDeviceId(deviceId: number): Promise<SessionDbRecord[]>;
  findByIpAddress(ipAddress: string): Promise<SessionDbRecord[]>;
  create(data: CreateSession): Promise<SessionDbRecord | null>;
  deleteById(id: number): Promise<boolean>;
  save(record: SessionDbRecord): Promise<SessionDbRecord>;
}
