import { recordSocketKicked } from '@/core/infrastucture/metrics';
import { getIO } from '@/socket';

export class TerminateSocketConnection {
  execute(connectionId: string): number {
    const io = getIO();
    const room = io.sockets.adapter.rooms.get(connectionId);

    if (!room || room.size === 0) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const socketIds = Array.from(room);

    for (const socketId of socketIds) {
      io.sockets.sockets.get(socketId)?.disconnect(true);
    }

    recordSocketKicked('admin_terminate_connection', socketIds.length);

    return socketIds.length;
  }
}
