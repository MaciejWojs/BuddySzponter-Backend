import { z } from 'zod';

import { APP_CONFIG } from '@/config/appConfig';

export const connectionTokenSchema = z
  .string()
  .length(
    APP_CONFIG.connection.security.tokenLengthBytes * 2,
    `Connection token must be ${APP_CONFIG.connection.security.tokenLengthBytes * 2} characters long (hex string of ${APP_CONFIG.connection.security.tokenLengthBytes} bytes)`
  );

export const authTokenSchema = z.jwt();
export const sessionIdSchema = z.uuid();
