import logger from '@logger';
import { createHash, randomBytes } from 'crypto';

import { APP_CONFIG } from '@/config/appConfig';
import { client } from '@/infrastucture/cache/client';

export type ConnectionRole = Uppercase<'host' | 'guest'>;

export type ConnectionTokenData = {
  connectionId: string;
  role: ConnectionRole;
  deviceId: string;
};

export class TokenService {
  /** Creates a connection token, stores it in cache, and returns the raw token.
   * The token is hashed before storage for security. The stored data includes the connection ID, role, and device ID, and it expires after a configured TTL.
   * Throws an error if the cache client is not connected, if required parameters are missing, or if storing the token in cache fails.
   */
  async createConnectionToken(data: ConnectionTokenData): Promise<string> {
    if (!client.connected) {
      throw new Error(
        'Cache client is not connected. Cannot store connection token.'
      );
    }

    const { deviceId, role, connectionId } = data;
    if (!deviceId || !role || !connectionId) {
      throw new Error(
        'Missing required parameters to create connection token.'
      );
    }

    const raw = this.generateToken();
    const hashedToken = this.hashToken(raw);

    const payload = JSON.stringify(data);

    const result = await client.setex(
      `${APP_CONFIG.connection.cache.keys.tokenPrefix}${hashedToken}`,
      APP_CONFIG.connection.security.tokenTTLSeconds,
      payload
    );

    if (result !== 'OK') {
      throw new Error('Failed to store connection token. Please try again.');
    }

    const lookup = await client.sadd(
      `${APP_CONFIG.connection.cache.keys.uuidPrefix}${connectionId}:tokens`,
      hashedToken
    );

    if (lookup === 0) {
      logger.warn(
        `Failed to add token to connection token set for connection ${connectionId}. Token may not be properly tracked for cleanup.`
      );
    }

    return raw;
  }

  private async findTokenData(hashedToken: string): Promise<{
    connectionId: string;
    role: ConnectionRole;
    deviceId: string;
  } | null> {
    if (!client.connected) {
      throw new Error(
        'Cache client is not connected. Cannot retrieve connection token.'
      );
    }

    const data = await client.get(
      `${APP_CONFIG.connection.cache.keys.tokenPrefix}${hashedToken}`
    );

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch {
      throw new Error('Failed to parse token data from cache.');
    }
  }

  private generateToken(): string {
    return randomBytes(
      APP_CONFIG.connection.security.tokenLengthBytes
    ).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async revokeToken(
    hashedToken: string,
    connectionId: string
  ): Promise<boolean> {
    if (!client.connected) {
      throw new Error('Cache client is not connected.');
    }
    const tokenKey = `${APP_CONFIG.connection.cache.keys.tokenPrefix}${hashedToken}`;
    const setKey = `${APP_CONFIG.connection.cache.keys.uuidPrefix}${connectionId}:tokens`;

    const tasks = await Promise.all([
      client.del(tokenKey),
      client.srem(setKey, hashedToken)
    ]);

    if (tasks[0] === 0) {
      logger.warn(
        `Attempted to revoke token ${hashedToken} for connection ${connectionId}, but it was not found in cache.`
      );
      return false;
    }

    if (tasks[1] === 0) {
      logger.warn(
        `Token ${hashedToken} was revoked but was not found in connection token set for connection ${connectionId}. This may indicate a tracking issue.`
      );
    }

    return true;
  }

  async revokeTokensForConnection(connectionId: string): Promise<void> {
    if (!client.connected) {
      throw new Error('Cache client is not connected.');
    }

    const setKey = `${APP_CONFIG.connection.cache.keys.uuidPrefix}${connectionId}:tokens`;
    const hashedTokens = await client.smembers(setKey);

    if (hashedTokens.length === 0) {
      logger.info(`No tokens found to revoke for connection ${connectionId}.`);
      return;
    }

    const revokeTasks = hashedTokens.map((hashedToken) =>
      this.revokeToken(hashedToken, connectionId)
    );

    await Promise.all(revokeTasks);
    await client.del(setKey);
  }

  async verifyToken(raw: string): Promise<ConnectionTokenData | null> {
    const hashedToken = this.hashToken(raw);
    return this.findTokenData(hashedToken);
  }
}
