import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultHook } from '@shared/api/openapi/defaultHook';
import { createECDH, createHash, randomUUID } from 'crypto';
import { ReasonPhrases } from 'http-status-codes';

import { APP_CONFIG } from '@/config/appConfig';
import { client } from '@/infrastucture/cache/client';

import { handshakeRoute } from './crypto.openapi';

const cryptoRouter = new OpenAPIHono({ defaultHook });

cryptoRouter.openapi(handshakeRoute, async (c) => {
  const data = c.req.valid('json');

  const clientPublicKey = Buffer.from(data.clientPublicKey, 'base64');

  const ecdh = createECDH(APP_CONFIG.crypto.ecdhCurve);
  const serverPublicKey = ecdh.generateKeys('base64');

  const sharedSecret = ecdh.computeSecret(clientPublicKey, 'base64');

  const aesKey = createHash('sha256').update(sharedSecret).digest();

  const sessionId = randomUUID();

  const result = await client.setex(
    `${APP_CONFIG.cache.keys.handshakePrefix}${sessionId}`,
    APP_CONFIG.cache.ttl.handshakeSession,
    aesKey.toString('base64'),
  );

  if (result !== 'OK') {
    return c.json(
      { message: ReasonPhrases.INTERNAL_SERVER_ERROR } as const,
      500,
    );
  }
  return c.json(
    {
      serverPublicKey: serverPublicKey,
      sessionId: sessionId,
    },
    200,
  );
});

export default cryptoRouter;
