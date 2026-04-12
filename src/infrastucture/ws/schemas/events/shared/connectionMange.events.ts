import { z } from 'zod';

/** Event sent by the server when guest acknowledges that they received connection:accepted
 * OR sent by host to confirm that they received connection:acknowledged from server
 *
 * Event sent by host to guest after receiving acknowledge from guest that connection:accepted event was received and processed successfully
 * This event should end connection setup process and allow both parties to start exchanging WebRTC offers/answers and ICE candidates
 */
export const connectionAknowledgedEventSchema = z.object({
  sessionId: z.uuid()
});
