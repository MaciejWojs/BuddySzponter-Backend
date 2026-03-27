import { z } from 'zod';

/** Used by client to request access to another peer */
export const requestAccessEventSchema = z.object({
  sessionId: z.uuid()
});

/** Used by host to accept connection request */
export const acceptConnectionEventSchema = z.object({
  sessionId: z.uuid()
});

/** Used by host to reject connection request */
export const rejectConnectionEventSchema = z.object({
  sessionId: z.uuid()
});

/** Used by client to disconnect from a connection */
export const disconnectFromConnectionSchema = z.object({
  reason: z.string().optional()
});
