import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import logger from '@logger';
import authRouter from '@modules/auth/api/auth.routes';
import sessionRouter from '@modules/sessions/api/sessions.routes';
import usersRouter from '@modules/users/api/users.routes';
import { Scalar } from '@scalar/hono-api-reference';
import { encryptPayloadBody } from '@shared/api/middleware/encrypt-body-payload';
import { defaultHook } from '@shared/api/openapi/defaultHook';
import { showRoutes } from 'hono/dev';
import { HTTPException } from 'hono/http-exception';
import { logger as honoLogger } from 'hono/logger';
import { StatusCodes } from 'http-status-codes';

import { version } from '../package.json';
import { configProvider } from './config/configProvider';
import { getEngine, initSocket } from './socket';

const app = new OpenAPIHono({ defaultHook }).basePath('/api/v1');

app.use(honoLogger());
app.use('*', encryptPayloadBody);

const isDevelopment = configProvider.get('DEVELOPMENT');
initSocket();
const engine = getEngine();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        message: err.message,
        errors: err.cause,
      },
      err.status,
    );
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
app.route('/sessions', sessionRouter);

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
  port: 3000,
  idleTimeout: 30,

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
