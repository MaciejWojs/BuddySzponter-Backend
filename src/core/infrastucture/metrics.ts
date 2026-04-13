import { prometheus } from '@hono/prometheus';
import { Counter, Gauge, Registry } from 'prom-client';
import { Server } from 'socket.io';

const registry = new Registry();

export const { registerMetrics, printMetrics } = prometheus({
  registry,
  collectDefaultMetrics: true
});

const socketConnectionAttemptsTotal =
  (registry.getSingleMetric(
    'ws_connection_attempts_total'
  ) as Counter<string>) ||
  new Counter({
    name: 'ws_connection_attempts_total',
    help: 'Total number of host-guest WebSocket connection attempts (with connection token)',
    registers: [registry]
  });

const socketConnectionsRejectedTotal =
  (registry.getSingleMetric(
    'ws_connections_rejected_total'
  ) as Counter<'reason'>) ||
  new Counter({
    name: 'ws_connections_rejected_total',
    help: 'Total number of rejected host-guest WebSocket connection attempts',
    labelNames: ['reason'],
    registers: [registry]
  });

const socketKickedTotal =
  (registry.getSingleMetric('ws_kicked_total') as Counter<'reason'>) ||
  new Counter({
    name: 'ws_kicked_total',
    help: 'Total number of sockets disconnected by server-side actions',
    labelNames: ['reason'],
    registers: [registry]
  });

const activeSocketsGauge =
  (registry.getSingleMetric('ws_active_sockets') as Gauge<string>) ||
  new Gauge({
    name: 'ws_active_sockets',
    help: 'Current number of active WebSocket connections',
    registers: [registry]
  });

const activeHostGuestRoomsGauge =
  (registry.getSingleMetric('ws_active_host_guest_rooms') as Gauge<string>) ||
  new Gauge({
    name: 'ws_active_host_guest_rooms',
    help: 'Current number of active host-guest rooms (exactly 2 clients)',
    registers: [registry]
  });

activeSocketsGauge.set(0);
activeHostGuestRoomsGauge.set(0);

export function recordSocketConnectionAttempt() {
  socketConnectionAttemptsTotal.inc();
}

export function recordSocketConnectionRejected(reason: string) {
  socketConnectionsRejectedTotal.inc({ reason });
}

export function recordSocketKicked(reason: string, amount = 1) {
  socketKickedTotal.inc({ reason }, amount);
}

export function updateSocketGauges(io: Server) {
  activeSocketsGauge.set(io.sockets.sockets.size);

  const socketIds = new Set(io.sockets.sockets.keys());
  const activeHostGuestRooms = Array.from(
    io.sockets.adapter.rooms.entries()
  ).filter(
    ([roomId, sockets]) => !socketIds.has(roomId) && sockets.size === 2
  ).length;

  activeHostGuestRoomsGauge.set(activeHostGuestRooms);
}
