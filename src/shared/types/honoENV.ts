import { IpAddress } from '../value-objects';

export type ENV = {
  Variables: {
    'client-ip': IpAddress | null;
  };
};
