import { z } from 'zod';

/** Event sent by the server when a connection is accepted */
export const ConnectionAcceptedEventSchema = z.object({
  sessionId: z.uuid()
});

/** Event sent by the server when a connection request is rejected */
export const ConnectionRejectedEventSchema = z.object({
  sessionId: z.uuid()
});

/** Event sent by the server when a connection is terminated */
export const ConnectionDisconnectedEventSchema = z.object({
  reason: z.string().optional()
});

export const terminateConnectionEventSchema = z.object({
  reason: z.string().optional()
});

export const kickFromConnectionEventSchema = z.object({
  reason: z.string().optional()
});

export const connectionErrorEventSchema = z.object({
  message: z.string(),
  code: z.number().optional()
});

export const connectionResumedEventSchema = z.object({
  sessionId: z.uuid()
});

export const connectionResumeFailedEventSchema = z.object({
  reason: z.enum([
    'expired',
    'invalid',
    'room_closed',
    'room_full',
    'device_mismatch'
  ])
});
