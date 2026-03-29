import { rolesTable } from '@infra/db/schema';

export type RoleDbRecord = typeof rolesTable.$inferSelect;

export type CreateRole = Omit<RoleDbRecord, 'id' | 'createdAt'>;

export interface IRolesDAO {
  findMany(): Promise<RoleDbRecord[]>;
  findById(id: number): Promise<RoleDbRecord | null>;
  findByName(name: string): Promise<RoleDbRecord | null>;
  create(data: CreateRole): Promise<RoleDbRecord | null>;
  deleteById(id: number): Promise<boolean>;
  save(record: RoleDbRecord): Promise<RoleDbRecord>;
}
