export type ConnectionPrimitive = {
  status: string;
  hostIpAddress: string;
  hostDeviceId: string | null;
  hostId: number | null;
  guestIpAddress: string | null;
  guestDeviceId: string | null;
  guestId: number | null;
  password: string;
  code: string;
  connectionUUID: string;
  hostFingerprint: string;
  guestFingerprint: string | null;
  startedAt: string | null;
  joinAttempts?: number;
};
