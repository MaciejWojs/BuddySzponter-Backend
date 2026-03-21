import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import logger from '@logger';
import authRouter from '@modules/auth/api/auth.routes';
import connectionRouter from '@modules/connection/api/connection.routes';
import coreRouter from '@modules/core/api/core.routes';
import cryptoRouter from '@modules/crypto/api/crypto.routes';
import usersRouter from '@modules/users/api/users.routes';
import { Scalar } from '@scalar/hono-api-reference';
import { encryptPayloadBody } from '@shared/api/middleware/encrypt-body-payload';
import { defaultHook } from '@shared/api/openapi/defaultHook';
import { ENV } from '@shared/types/honoENV';
import { showRoutes } from 'hono/dev';
import { HTTPException } from 'hono/http-exception';
import { logger as honoLogger } from 'hono/logger';
import { StatusCodes } from 'http-status-codes';

import { version } from '../package.json';
import { APP_CONFIG } from './config/appConfig';
import { configProvider } from './config/configProvider';
import { initCache } from './infrastucture/cache/client';
import { decryptBodyPayload } from './shared/api/middleware/decrypt-body-payload';
import { extendEncryptionKeyTTL } from './shared/api/middleware/extendEncryptionKeyTTL';
import { injectIpAddress } from './shared/api/middleware/injectIpAddress';
import { injectJwtPayload } from './shared/api/middleware/injectJwtPayload';
import { defaultErrorResponseSchema } from './shared/api/schemas/error.schema';
import { getEngine, initSocket } from './socket';
import { validateAccessJWT } from './shared/api/middleware/validate-access-jwt';

const app = new OpenAPIHono<ENV>({ defaultHook }).basePath('/api/v1');


app.use(honoLogger());
app.use('*', injectIpAddress);
app.use('*', injectJwtPayload);
app.use('*', validateAccessJWT);
app.use('*', decryptBodyPayload);
app.use('*', encryptPayloadBody);
app.use('*', extendEncryptionKeyTTL);

const isDevelopment = configProvider.get('DEVELOPMENT');
initSocket();
initCache();
const engine = getEngine();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errorResponse = {
      message: err.message,
      cause: err.cause,
    };

    const result = defaultErrorResponseSchema.safeParse(errorResponse);

    if (!result.success) {
      const errorDetails = result.error.issues
        .map((issue) => {
          const path =
            issue.path.length > 0
              ? `['${issue.path.join('.')}' - ${issue.message}]`
              : `[${issue.message}]`;
          return path;
        })
        .join(', ');
      const requestInfo = `[${err.status}] ${c.req.method} ${c.req.url}`;
      const message = `[FIX IT!] Error response validation failed during ${requestInfo} with ${errorDetails}`;
      logger.error(message);
    }

    return c.json(errorResponse, err.status);
  }
  if (isDevelopment) {
    logger.error('Unhandled error in global error handler:', err);
  }
  return c.json(
    { message: 'Internal Server Error' },
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
});

app.get('/', (c) =>
  c.text(
    'This is the Buddy Szponter backend. WebSocket endpoint is at /socket.io/',
  ),
);
app.route('/auth', authRouter);
app.route('/users', usersRouter);
app.route('/connections', connectionRouter);
app.route('/crypto', cryptoRouter);
app.route('/core', coreRouter);
const { websocket } = engine.handler();

if (isDevelopment) {
  app.doc('/docs', (c) => ({
    openapi: '3.0.0',
    info: {
      version: version,
      title: 'My API',
    },
    servers: [
      {
        url: new URL(c.req.url).origin,
        description: 'Current environment',
      },
    ],
  }));
  app.get('/docs/scalar', Scalar({ url: '/api/v1/docs' }));
  app.get('/docs/ui', swaggerUI({ url: '/api/v1/docs' }));
  showRoutes(app);
}

export default {
  port: APP_CONFIG.server.port,
  idleTimeout: APP_CONFIG.server.idleTimeout,

  //@ts-expect-error Its from Socket.IO Bun Engine github example, but it seems to be missing from types
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === '/socket.io/') {
      return engine.handleRequest(req, server);
    } else {
      return app.fetch(req, server);
    }
  },

  websocket,
};
