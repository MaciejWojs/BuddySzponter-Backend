import { devicesTable } from '@infra/db/schema';

export type DeviceDbRecord = typeof devicesTable.$inferSelect;
