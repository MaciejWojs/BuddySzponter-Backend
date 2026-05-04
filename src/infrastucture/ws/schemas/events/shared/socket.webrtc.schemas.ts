import { z } from 'zod';

export const webrtcOfferSchema = z.object({
  sdp: z.string()
});

export const webrtcAnswerSchema = z.object({
  sdp: z.string()
});

export const iceCandidateSchema = z.object({
  candidate: z.any()
});

export const readySchema = z.object({});

export const e2eHandshakeInitSchema = z.object({
  publicKey: z.string().min(1).max(2048)
});

export const e2eHandshakeRespondSchema = z.object({
  publicKey: z.string().min(1).max(2048)
});

export const e2eHandshakeCompleteSchema = z.object({
  peerPublicKey: z.string().min(1).max(2048)
});
