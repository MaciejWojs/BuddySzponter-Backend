import { z } from 'zod';

export const activeSocketParticipantSchema = z.object({
  socketId: z.string().nullable().openapi({
    description: 'Socket.IO socket ID',
    example: '3Q6A2Jj0S7hUlb7sAAAB'
  }),
  role: z.enum(['HOST', 'GUEST']).nullable().openapi({
    description: 'Connection role assigned from connection token',
    example: 'HOST'
  }),
  deviceId: z.uuid().nullable().openapi({
    description: 'Device UUID assigned to this socket connection',
    example: 'f61de8df-df22-4a53-aa93-50614e10e96d'
  }),
  ipAddress: z.string().nullable().openapi({
    description: 'Client IP address from socket handshake',
    example: '192.168.0.25'
  }),
  connected: z.boolean().openapi({
    description: 'Whether participant is currently connected via socket',
    example: true
  }),
  connectedAt: z.date().nullable().openapi({
    description: 'Timestamp when the socket connected',
    example: '2026-04-22T10:10:10.000Z'
  })
});

export const activeSocketConnectionSchema = z.object({
  connectionId: z.string().openapi({
    description: 'Connection room identifier',
    example: '5bf78b31-89f9-4f24-b26b-43f2c4ef7c1b'
  }),
  connectedSocketsCount: z.number().int().min(0).openapi({
    description: 'Current number of connected sockets in the connection',
    example: 1
  }),
  expectedParticipantsCount: z.number().int().min(0).openapi({
    description: 'Expected number of participants in this connection',
    example: 2
  }),
  participants: z.array(activeSocketParticipantSchema)
});

export const activeSocketConnectionsResponseSchema = z.array(
  activeSocketConnectionSchema
);

export const terminateSocketConnectionResponseSchema = z.object({
  message: z.string().min(2).max(255),
  disconnectedSockets: z.number().int().min(0).openapi({
    description: 'How many sockets were disconnected',
    example: 2
  })
});

export const kickSocketResponseSchema = z.object({
  message: z.string().min(2).max(255)
});
