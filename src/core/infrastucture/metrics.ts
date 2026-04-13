import { prometheus } from '@hono/prometheus';
import { Counter, Gauge, Registry } from 'prom-client';

import { configProvider } from '@/config/configProvider';

type PrometheusHandlers = ReturnType<typeof prometheus>;

type MetricsState = {
  handlers: PrometheusHandlers;
  socketConnectionAttemptsTotal: Counter<string>;
  socketConnectionsRejectedTotal: Counter<'reason'>;
  socketPostConnectionRejectedTotal: Counter<'reason'>;
  socketKickedTotal: Counter<'reason'>;
  activeSocketsGauge: Gauge<string>;
  activeHostGuestRoomsGauge: Gauge<string>;
};

let metricsState: MetricsState | undefined;

const isMonitoringEnabled = () => configProvider.get('MONITORING_ENABLED');

function getMetricsState(): MetricsState {
  if (metricsState) {
    return metricsState;
  }

  const registry = new Registry();
  const handlers = prometheus({
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

  const socketPostConnectionRejectedTotal =
    (registry.getSingleMetric(
      'ws_post_connection_rejected_total'
    ) as Counter<'reason'>) ||
    new Counter({
      name: 'ws_post_connection_rejected_total',
      help: 'Total number of host-guest rejections after connection is established',
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

  metricsState = {
    handlers,
    socketConnectionAttemptsTotal,
    socketConnectionsRejectedTotal,
    socketPostConnectionRejectedTotal,
    socketKickedTotal,
    activeSocketsGauge,
    activeHostGuestRoomsGauge
  };

  return metricsState;
}

export function registerMetrics(
  ...args: Parameters<PrometheusHandlers['registerMetrics']>
) {
  return getMetricsState().handlers.registerMetrics(...args);
}

export function printMetrics(
  ...args: Parameters<PrometheusHandlers['printMetrics']>
) {
  return getMetricsState().handlers.printMetrics(...args);
}

export function recordSocketConnectionAttempt() {
  if (!isMonitoringEnabled()) return;
  getMetricsState().socketConnectionAttemptsTotal.inc();
}

export function recordSocketConnectionRejected(reason: string) {
  if (!isMonitoringEnabled()) return;
  getMetricsState().socketConnectionsRejectedTotal.inc({ reason });
}

export function recordSocketPostConnectionRejected(reason: string) {
  if (!isMonitoringEnabled()) return;
  getMetricsState().socketPostConnectionRejectedTotal.inc({ reason });
}

export function recordSocketKicked(reason: string, amount = 1) {
  if (!isMonitoringEnabled()) return;
  getMetricsState().socketKickedTotal.inc({ reason }, amount);
}

export function updateSocketGauges(
  activeSockets: number,
  activeHostGuestRooms: number
) {
  if (!isMonitoringEnabled()) return;

  const { activeSocketsGauge, activeHostGuestRoomsGauge } = getMetricsState();
  activeSocketsGauge.set(activeSockets);
  activeHostGuestRoomsGauge.set(activeHostGuestRooms);
}
