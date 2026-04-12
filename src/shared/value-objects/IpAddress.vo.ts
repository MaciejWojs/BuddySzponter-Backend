import { configProvider } from '@config/configProvider';
import { z } from 'zod';

const ipV4Schema = z.ipv4();
const ipV6Schema = z.ipv6();

const isDevelopment = configProvider.get('DEVELOPMENT');

const INVALID_IPS = [
  '0.0.0.0',
  '255.255.255.255',
  '::',
  'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'
];

const LOOPBACKS = ['127.', '::1'];

export class IpAddress {
  constructor(private address: string) {
    const isIPv4 = ipV4Schema.safeParse(address).success;
    const isIPv6 = ipV6Schema.safeParse(address).success;

    if (!isIPv4 && !isIPv6) {
      throw new Error('Invalid IP address');
    }

    if (INVALID_IPS.includes(address)) {
      throw new Error(`IP address cannot be ${address}`);
    }

    if (!isDevelopment) {
      if (
        LOOPBACKS.some((loop) =>
          loop.endsWith('.') ? address.startsWith(loop) : address === loop
        )
      ) {
        throw new Error(`IP address cannot be a loopback address: ${address}`);
      }
    }

    this.address = address;
  }

  get value(): string {
    return this.address;
  }
}
