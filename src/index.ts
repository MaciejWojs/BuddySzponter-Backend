import { Hono } from 'hono';
import { initSocket, getEngine } from './socket';

const app = new Hono();

initSocket();
const engine = getEngine();

app.get('/', (c) =>
  c.text(
    'This is the Buddy Szponter backend. WebSocket endpoint is at /socket.io/',
  ),
);

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
