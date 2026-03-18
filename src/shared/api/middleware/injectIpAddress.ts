import logger from '@logger';
import { IpAddress } from '@/shared/value-objects';
import { getConnInfo } from 'hono/bun';
import { createMiddleware } from 'hono/factory';
import { ENV } from '@/shared/types/honoENV';

export const injectIpAddress = createMiddleware<ENV>(async (c, next) => {
  const info = getConnInfo(c);

  const headerIp = c.req.header('X-Real-IP');
  const fallbackIp = info?.remote?.address ?? null;

  const ipAddress = headerIp ?? fallbackIp;

  if (!ipAddress) {
    logger.warn('[IP Middleware] Unable to determine client IP address');
    return next();
  }

  try {
    const ip = new IpAddress(ipAddress);
    c.set('client-ip', ip);
  } catch (error) {
    c.set('client-ip', null);
    logger.warn('[IP Middleware] Invalid IP address:', ipAddress);
  }

  await next();
});
