import { IoMiddlewareParams,SocketMiddlewareParams } from '@/shared/types/ws';

export interface ISocketMiddleware {
  use(...args: SocketMiddlewareParams | IoMiddlewareParams): void;
}
