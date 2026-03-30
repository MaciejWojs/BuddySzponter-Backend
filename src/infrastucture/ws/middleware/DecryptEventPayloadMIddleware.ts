import { Socket } from 'socket.io';

import logger from '@/infrastucture/logger';
import { encryptedPayloadSchema } from '@/shared/api/schemas/encryptedPayload.schema';
import { ValidationError } from '@/shared/errors/Specialized/ValidationError';
import { SocketMiddlewareParams } from '@/shared/types/ws';
import { decryptPayload } from '@/shared/utils/decrypt-payload';

import { BaseMiddleware } from './BaseMiddleware';
import { ISocketMiddleware } from './ISocketMiddleware';

export class DecryptEventPayloadMiddleware
  extends BaseMiddleware
  implements ISocketMiddleware
{
  private socket: Socket;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
  }

  override use(...args: SocketMiddlewareParams): void {
    const [packet, next] = args;
    const [eventName, data] = packet;

    logger.onlyDev(`Packet ${JSON.stringify(packet)} `);

    logger.onlyDev(`Packet[0] ${JSON.stringify(packet[0])} `);

    logger.onlyDev(`Packet[1] ${JSON.stringify(packet[1])} `);

    if (!data) {
      logger.warn(
        `Received event ${eventName} with no data from ${this.socket.id}, skipping decryption. Its completely valid for some events to not have data`
      );
      return next();
    }
    const isEnctyptedFormat = encryptedPayloadSchema.safeParse(data);

    if (!isEnctyptedFormat.success) {
      return next(
        new Error(
          `Data is not encrypted or wrong payload format during ${eventName}`
        )
      );
    }

    try {
      const decryptedData = decryptPayload(
        data,
        this.socket.data.encryptionKey
      );
      logger.onlyDev(
        `Decrypted data for message from ${this.socket.id}: ${JSON.stringify(decryptedData)}`
      );
      packet[1] = decryptedData;
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn(
          `Decryption failed for message from ${this.socket.id}: ${error.message}`
        );
        return next(new Error(`Decryption failed: ${error.message}`));
      }
      logger.error(
        `Unexpected error during decryption for message from ${this.socket.id}:`,
        error
      );
      return next(new Error('Decryption failed due to unexpected error'));
    }
    next();
  }
}
