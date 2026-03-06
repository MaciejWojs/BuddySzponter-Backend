import { Hono } from 'hono';
import { initSocket, getEngine } from './socket';
import { configProvider } from './config/configProvider';
import authRouter from './modules/auth/api/auth.routes';
import usersRouter from './modules/users/api/users.routes';
import sessionRouter from './modules/sessions/api/sessions.routes';
import { HTTPException } from 'hono/http-exception';
import logger from '@logger';

const app = new Hono().basePath('/api/v1');

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
  return c.json({ message: 'Internal Server Error' }, 500);
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
