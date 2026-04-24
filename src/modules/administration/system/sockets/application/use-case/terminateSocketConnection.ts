import { recordSocketKicked } from '@/core/infrastucture/metrics';
import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import { getIO } from '@/socket';

export class TerminateSocketConnection {
  async execute(connectionId: string): Promise<number> {
    const io = getIO();
    const room = io.sockets.adapter.rooms.get(connectionId);
    const socketIds = room ? Array.from(room) : [];

    for (const socketId of socketIds) {
      io.sockets.sockets.get(socketId)?.disconnect(true);
    }

    if (socketIds.length > 0) {
      recordSocketKicked('admin_terminate_connection', socketIds.length);
    }

    const connectionRepository = new RepositoryFactory().connectionRepository();
    const deletedLogicalConnection =
      await connectionRepository.deleteConnection(connectionId);

    if (!deletedLogicalConnection && socketIds.length === 0) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    return socketIds.length;
  }
}
