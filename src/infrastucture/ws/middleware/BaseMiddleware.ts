import { IoMiddlewareParams, SocketMiddlewareParams } from '@/shared/types/ws';

export abstract class BaseMiddleware<
  T extends SocketMiddlewareParams | IoMiddlewareParams =
    SocketMiddlewareParams
> {
  abstract use(...args: T): void;
}
