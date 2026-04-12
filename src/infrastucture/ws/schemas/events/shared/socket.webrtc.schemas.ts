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
