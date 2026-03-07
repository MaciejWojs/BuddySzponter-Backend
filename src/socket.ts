import { Server } from 'socket.io';
import { Server as Engine } from '@socket.io/bun-engine';
import logger from '@logger';

let io: Server;
let engine: Engine;

export function initSocket() {
  if (io) return { io, engine };

  io = new Server();
  engine = new Engine();

  io.bind(engine);

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('message', (message) => {
      logger.info(`Received message from ${socket.id}: ${message}`);
      socket.send('Message received: ' + message);
    });
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return { io, engine };
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function getEngine() {
  if (!engine) {
    throw new Error('Engine not initialized');
  }
  return engine;
}
