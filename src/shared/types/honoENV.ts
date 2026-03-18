import { IpAddress } from '../value-objects';

export type ENV = {
  Variables: {
    'client-ip': IpAddress | null;
    'jwt-payload': { userId: number; role: string } | null;
  };
};
