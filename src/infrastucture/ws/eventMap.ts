import { z } from 'zod';

import { Flatten } from '@/shared/types/Flatten';

import {
  acceptConnectionEventSchema,
  disconnectFromConnectionSchema,
  guestAcknowledgeConnectionSchema,
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
import { connectionAknowledgedEventSchema } from './schemas/events/shared/connectionMange.events';
import {
  e2eHandshakeCompleteSchema,
  e2eHandshakeInitSchema,
  e2eHandshakeRespondSchema,
  iceCandidateSchema,
  readySchema,
  webrtcAnswerSchema,
  webrtcOfferSchema
} from './schemas/events/shared/socket.webrtc.schemas';

/** Webrtc events sent by clients */
const incomingWebrtcEventSchemas = {
  'webrtc:offer': webrtcOfferSchema,
  'webrtc:answer': webrtcAnswerSchema,
  'webrtc:ice-candidate': iceCandidateSchema,
  'webrtc:ready': readySchema,
  'webrtc:e2e-handshake:init': e2eHandshakeInitSchema,
  'webrtc:e2e-handshake:respond': e2eHandshakeRespondSchema
} as const;

/** Webrtc events sent by server */
const outgoingWebrtcEventSchemas = {
  'webrtc:offer': webrtcOfferSchema,
  'webrtc:answer': webrtcAnswerSchema,
  'webrtc:ice-candidate': iceCandidateSchema,
  'webrtc:ready': readySchema,
  'webrtc:e2e-handshake:complete': e2eHandshakeCompleteSchema
} as const;

const sharedEventSchemas = {
  'connection:request-access': requestAccessEventSchema,
  'connection:acknowledged': connectionAknowledgedEventSchema
} as const;

/** Events sent by the client */
export const incomingEventSchemas = {
  ...incomingWebrtcEventSchemas,
  ...sharedEventSchemas,
  'connection:accept': acceptConnectionEventSchema,
  'connection:reject': rejectConnectionEventSchema,
  'connection:disconnect': disconnectFromConnectionSchema,
  'connection:acknowledge': guestAcknowledgeConnectionSchema
} as const;

/** Events sent by the server */
export const outgoingEventSchemas = {
  ...outgoingWebrtcEventSchemas,
  ...sharedEventSchemas,
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
  [K in keyof typeof incomingEventSchemas]: Flatten<
    {
      readonly event: K;
    } & z.infer<(typeof incomingEventSchemas)[K]>
  >;
};

export const OutgoingEventNames = new Set<keyof OutgoingEventPayloads>(
  Object.keys(outgoingEventSchemas) as Array<keyof OutgoingEventPayloads>
);

export type OutgoingEventPayloads = {
  [K in keyof typeof outgoingEventSchemas]: z.infer<
    (typeof outgoingEventSchemas)[K] & { readonly event: K }
  >;
};
