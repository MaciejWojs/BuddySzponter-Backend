import { Server, Socket } from 'socket.io';

export type IoMiddlewareParams = Parameters<Parameters<Server['use']>[0]>;

export type SocketMiddlewareParams = Parameters<Parameters<Socket['use']>[0]>;
