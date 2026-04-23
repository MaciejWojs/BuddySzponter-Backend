import { recordSocketKicked } from '@/core/infrastucture/metrics';
import { getIO } from '@/socket';

export class KickSocketFromConnection {
  execute(connectionId: string, socketId: string): void {
    const io = getIO();
    const socket = io.sockets.sockets.get(socketId);

    if (!socket) {
      throw new Error(`Socket ${socketId} not found`);
    }

    const belongsToConnection =
      socket.data.connectionTokenData?.connectionId === connectionId;

    if (!belongsToConnection) {
      throw new Error(
        `Socket ${socketId} is not part of connection ${connectionId}`
      );
    }

    socket.disconnect(true);
    recordSocketKicked('admin_kick_socket');
  }
}
