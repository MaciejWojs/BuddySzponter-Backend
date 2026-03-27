import { z } from 'zod';

import {
  acceptConnectionEventSchema,
  disconnectFromConnectionSchema,
  rejectConnectionEventSchema,
  requestAccessEventSchema
} from './schemas/events/incoming/connectionMange.events';
import {
  ConnectionAcceptedEventSchema,
  ConnectionDisconnectedEventSchema,
  connectionErrorEventSchema,
  ConnectionRejectedEventSchema,
  kickFromConnectionEventSchema,
  terminateConnectionEventSchema
} from './schemas/events/outgoing/connectionMange.events';
import {
  iceCandidateSchema,
  readySchema,
  webrtcAnswerSchema,
  webrtcOfferSchema
} from './schemas/events/shared/socket.webrtc.schemas';

/** Webrtc events (shared) */
const webrtcEventSchemas = {
  'webrtc:offer': webrtcOfferSchema,
  'webrtc:answer': webrtcAnswerSchema,
  'webrtc:ice-candidate': iceCandidateSchema,
  'webrtc:ready': readySchema
} as const;

/** Events sent by the client */
export const incomingEventSchemas = {
  ...webrtcEventSchemas,
  'connection:request-access': requestAccessEventSchema,
  'connection:accept': acceptConnectionEventSchema,
  'connection:reject': rejectConnectionEventSchema,
  'connection:disconnect': disconnectFromConnectionSchema
} as const;

/** Events sent by the server */
export const outgoingEventSchemas = {
  ...webrtcEventSchemas,
  'connection:accepted': ConnectionAcceptedEventSchema,
  'connection:rejected': ConnectionRejectedEventSchema,
  'connection:disconnected': ConnectionDisconnectedEventSchema,
  'connection:terminate': terminateConnectionEventSchema,
  'connection:kick': kickFromConnectionEventSchema,
  'connection:error': connectionErrorEventSchema
} as const;

export const IncomingEventNames = new Set<keyof IncomingEventPayloads>(
  Object.keys(incomingEventSchemas) as Array<keyof IncomingEventPayloads>
);

export type IncomingEventPayloads = {
  [K in keyof typeof incomingEventSchemas]: z.infer<
    (typeof incomingEventSchemas)[K]
  >;
};

export const OutgoingEventNames = new Set<keyof OutgoingEventPayloads>(
  Object.keys(outgoingEventSchemas) as Array<keyof OutgoingEventPayloads>
);

export type OutgoingEventPayloads = {
  [K in keyof typeof outgoingEventSchemas]: z.infer<
    (typeof outgoingEventSchemas)[K]
  >;
};
