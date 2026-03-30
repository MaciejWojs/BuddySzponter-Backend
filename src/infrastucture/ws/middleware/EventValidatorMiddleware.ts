import { Socket } from 'socket.io';

import logger from '@/infrastucture/logger';
import { SocketMiddlewareParams } from '@/shared/types/ws';

import { incomingEventSchemas } from '../eventMap';
import { BaseMiddleware } from './BaseMiddleware';
import { ISocketMiddleware } from './ISocketMiddleware';

export class EventValidatorMiddleware
  extends BaseMiddleware
  implements ISocketMiddleware
{
  private readonly socket: Socket;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
  }

  override use(...args: SocketMiddlewareParams): void {
    const [packet, next] = args;
    const [eventName, data] = packet;
    logger.info(
      `[EVENT VALIDATOR MIDDLEWARE] ${eventName} from ${this.socket.id}: ${JSON.stringify(data)}`
    );
    if (!data) {
      logger.warn(
        `Received event ${eventName} with no data from ${this.socket.id}, skipping decryption. Its completely valid for some events to not have data`
      );
      packet[1] = { event: eventName };
      return next();
    }

    if (
      eventName === 'connection' ||
      eventName === 'disconnect' ||
      eventName === 'error'
    ) {
      logger.onlyDev(`Skipping validation for special event ${eventName}`);
      packet[1] = { event: eventName, ...data };
      return next();
    }

    const schema =
      incomingEventSchemas[eventName as keyof typeof incomingEventSchemas];
    if (!schema) {
      logger.warn(
        `No schema defined for event ${eventName}, skipping validation`
      );
      return next(
        new Error(`Unrecognized event: ${eventName}, no validation schema`)
      );
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      logger.warn(
        `Validation failed for event ${eventName} from ${this.socket.id}: ${JSON.stringify(result.error.issues)}`
      );
      const errorDetails = result.error.issues
        .map((issue) => {
          const path =
            issue.path.length > 0
              ? `['${issue.path.join('.')}' - ${issue.message}]`
              : `[${issue.message}]`;
          return path;
        })
        .join(', ');
      return next(new Error('Invalid event payload: ' + errorDetails));
    }
    const finalData = { event: eventName, ...result.data };
    packet[1] = finalData;
    next();
  }
}
