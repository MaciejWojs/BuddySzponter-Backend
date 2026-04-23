import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import { ConnectionStatus } from '@/modules/connection/domain/value-objects';
import { getIO } from '@/socket';

export type ActiveSocketParticipant = {
  socketId: string | null;
  role: 'HOST' | 'GUEST' | null;
  deviceId: string | null;
  ipAddress: string | null;
  connected: boolean;
  connectedAt: Date | null;
};

export type ActiveSocketConnection = {
  connectionId: string;
  connectedSocketsCount: number;
  expectedParticipantsCount: number;
  participants: ActiveSocketParticipant[];
};

export class GetActiveSocketConnections {
  async execute(): Promise<ActiveSocketConnection[]> {
    const io = getIO();
    const runtimeParticipantsByConnection = new Map<
      string,
      ActiveSocketParticipant[]
    >();

    for (const [roomId, socketIds] of io.sockets.adapter.rooms) {
      // Skip private per-socket rooms.
      if (io.sockets.sockets.has(roomId)) {
        continue;
      }

      const participants = Array.from(socketIds)
        .map((socketId) => io.sockets.sockets.get(socketId))
        .filter((socket): socket is NonNullable<typeof socket> => !!socket)
        .filter(
          (socket) => socket.data.connectionTokenData?.connectionId === roomId
        )
        .map((socket) => ({
          socketId: socket.id,
          role:
            socket.data.connectionTokenData?.role === 'HOST' ||
            socket.data.connectionTokenData?.role === 'GUEST'
              ? socket.data.connectionTokenData.role
              : null,
          deviceId: socket.data.connectionTokenData?.deviceId ?? null,
          ipAddress: socket.handshake.address ?? null,
          connected: true,
          connectedAt: new Date(socket.handshake.issued)
        }));

      runtimeParticipantsByConnection.set(roomId, participants);
    }

    const connectionsById = new Map<string, ActiveSocketConnection>();

    // Include active logical connections from cache and reconcile with live sockets.
    const connectionRepository = new RepositoryFactory().connectionRepository();
    const activeConnections = await connectionRepository.findByStatus(
      ConnectionStatus.ACTIVE
    );

    for (const connection of activeConnections) {
      const connectionId = connection.id.value;
      const runtimeParticipants =
        runtimeParticipantsByConnection.get(connectionId) ?? [];

      const participants: ActiveSocketParticipant[] = [
        {
          socketId: null,
          role: 'HOST',
          deviceId: connection.host.deviceId?.value ?? null,
          ipAddress: connection.host.ipAddress.value,
          connected: false,
          connectedAt: null
        },
        {
          socketId: null,
          role: 'GUEST',
          deviceId: connection.guest?.deviceId?.value ?? null,
          ipAddress: connection.guest?.ipAddress.value ?? null,
          connected: false,
          connectedAt: null
        }
      ];

      const remainingRuntimeParticipants = [...runtimeParticipants];

      for (let i = 0; i < participants.length; i += 1) {
        const expected = participants[i]!;

        const matchingIndex = remainingRuntimeParticipants.findIndex(
          (runtimeParticipant) => {
            if (
              expected.role &&
              runtimeParticipant.role &&
              expected.role !== runtimeParticipant.role
            ) {
              return false;
            }

            if (
              expected.deviceId &&
              runtimeParticipant.deviceId &&
              expected.deviceId !== runtimeParticipant.deviceId
            ) {
              return false;
            }

            return true;
          }
        );

        if (matchingIndex >= 0) {
          const matchingRuntime = remainingRuntimeParticipants.splice(
            matchingIndex,
            1
          )[0]!;
          participants[i] = {
            ...expected,
            ...matchingRuntime,
            role: expected.role ?? matchingRuntime.role
          };
        }
      }

      // Include runtime sockets that did not match expected host/guest entries.
      participants.push(...remainingRuntimeParticipants);

      connectionsById.set(connectionId, {
        connectionId,
        connectedSocketsCount: runtimeParticipants.length,
        expectedParticipantsCount: 2,
        participants
      });
    }

    // Add runtime-only connections (in-memory) that may not exist in active cache list.
    for (const [
      connectionId,
      runtimeParticipants
    ] of runtimeParticipantsByConnection) {
      if (connectionsById.has(connectionId)) {
        continue;
      }

      connectionsById.set(connectionId, {
        connectionId,
        connectedSocketsCount: runtimeParticipants.length,
        expectedParticipantsCount: runtimeParticipants.length,
        participants: runtimeParticipants
      });
    }

    return Array.from(connectionsById.values());
  }
}
