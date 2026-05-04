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

type CachedTokenSet = 'primary' | 'resume';

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
      this.getTokenKey(hashedToken),
      APP_CONFIG.connection.security.tokenTTLSeconds,
      payload
    );

    if (result !== 'OK') {
      throw new Error('Failed to store connection token. Please try again.');
    }

    const lookup = await client.sadd(
      this.getConnectionTokenSetKey(connectionId),
      hashedToken
    );

    if (lookup === 0) {
      logger.warn(
        `Failed to add token to connection token set for connection ${connectionId}. Token may not be properly tracked for cleanup.`
      );
    }

    return raw;
  }

  private async findTokenData(
    hashedToken: string,
    source: CachedTokenSet = 'primary'
  ): Promise<{
    connectionId: string;
    role: ConnectionRole;
    deviceId: string;
  } | null> {
    if (!client.connected) {
      throw new Error(
        'Cache client is not connected. Cannot retrieve connection token.'
      );
    }

    const key =
      source === 'primary'
        ? this.getTokenKey(hashedToken)
        : this.getResumeTokenKey(hashedToken);

    const data = await client.get(key);

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

  private getConnectionResumeTokenSetKey(connectionId: string): string {
    return `${APP_CONFIG.connection.cache.keys.uuidPrefix}${connectionId}:resume_tokens`;
  }

  private getConnectionTokenSetKey(connectionId: string): string {
    return `${APP_CONFIG.connection.cache.keys.uuidPrefix}${connectionId}:tokens`;
  }

  private getResumeTokenKey(hashedToken: string): string {
    return `${APP_CONFIG.connection.cache.keys.resumeTokenPrefix}${hashedToken}`;
  }

  private getTokenKey(hashedToken: string): string {
    return `${APP_CONFIG.connection.cache.keys.tokenPrefix}${hashedToken}`;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async markTokenForReconnect(
    rawToken: string
  ): Promise<ConnectionTokenData | null> {
    const hashedToken = this.hashToken(rawToken);
    const primaryData = await this.findTokenData(hashedToken, 'primary');

    if (primaryData) {
      const primaryRevoked = await this.revokeTokenByHash(
        hashedToken,
        primaryData.connectionId,
        'primary'
      );

      if (primaryRevoked) {
        await this.upsertResumeToken(
          hashedToken,
          primaryData.connectionId,
          primaryData
        );
        return primaryData;
      }

      const resumeDataAfterRace = await this.findTokenData(
        hashedToken,
        'resume'
      );
      if (!resumeDataAfterRace) {
        return null;
      }

      await this.upsertResumeToken(
        hashedToken,
        resumeDataAfterRace.connectionId,
        resumeDataAfterRace
      );
      return resumeDataAfterRace;
    }

    const resumeData = await this.findTokenData(hashedToken, 'resume');
    if (!resumeData) {
      return null;
    }

    await this.upsertResumeToken(
      hashedToken,
      resumeData.connectionId,
      resumeData
    );
    return resumeData;
  }

  async revokeToken(rawToken: string, connectionId: string): Promise<boolean> {
    const hashedToken = this.hashToken(rawToken);
    const [primaryRevoked, resumeRevoked] = await Promise.all([
      this.revokeTokenByHash(hashedToken, connectionId, 'primary'),
      this.revokeTokenByHash(hashedToken, connectionId, 'resume')
    ]);

    return primaryRevoked || resumeRevoked;
  }

  private async revokeTokenByHash(
    hashedToken: string,
    connectionId: string,
    source: CachedTokenSet = 'primary'
  ): Promise<boolean> {
    if (!client.connected) {
      throw new Error('Cache client is not connected.');
    }
    const tokenKey =
      source === 'primary'
        ? this.getTokenKey(hashedToken)
        : this.getResumeTokenKey(hashedToken);
    const setKey =
      source === 'primary'
        ? this.getConnectionTokenSetKey(connectionId)
        : this.getConnectionResumeTokenSetKey(connectionId);

    const tasks = await Promise.all([
      client.del(tokenKey),
      client.srem(setKey, hashedToken)
    ]);

    if (tasks[0] === 0) {
      logger.warn(
        `Attempted to revoke ${source} token ${hashedToken} for connection ${connectionId}, but it was not found in cache.`
      );
      return false;
    }

    if (tasks[1] === 0) {
      logger.warn(
        `Token ${hashedToken} was revoked but was not found in ${source} token set for connection ${connectionId}. This may indicate a tracking issue.`
      );
    }

    return true;
  }

  async revokeTokensForConnection(connectionId: string): Promise<void> {
    if (!client.connected) {
      throw new Error('Cache client is not connected.');
    }

    const setKey = this.getConnectionTokenSetKey(connectionId);
    const resumeSetKey = this.getConnectionResumeTokenSetKey(connectionId);
    const [hashedTokens, hashedResumeTokens] = await Promise.all([
      client.smembers(setKey),
      client.smembers(resumeSetKey)
    ]);

    if (hashedTokens.length === 0 && hashedResumeTokens.length === 0) {
      logger.info(`No tokens found to revoke for connection ${connectionId}.`);
      return;
    }

    const revokeTasks = hashedTokens.map((hashedToken) =>
      this.revokeTokenByHash(hashedToken, connectionId, 'primary')
    );

    const revokeResumeTasks = hashedResumeTokens.map((hashedToken) =>
      this.revokeTokenByHash(hashedToken, connectionId, 'resume')
    );

    await Promise.all([...revokeTasks, ...revokeResumeTasks]);
    await client.del(setKey);
    await client.del(resumeSetKey);
  }

  private async upsertResumeToken(
    hashedToken: string,
    connectionId: string,
    data: ConnectionTokenData
  ): Promise<void> {
    const payload = JSON.stringify(data);
    const setResult = await client.setex(
      this.getResumeTokenKey(hashedToken),
      APP_CONFIG.connection.security.resumeTokenTTLSeconds,
      payload
    );

    if (setResult !== 'OK') {
      throw new Error('Failed to store resume token. Please try again.');
    }

    await client.sadd(
      this.getConnectionResumeTokenSetKey(connectionId),
      hashedToken
    );
  }

  async verifyToken(raw: string): Promise<ConnectionTokenData | null> {
    const hashedToken = this.hashToken(raw);
    const primaryToken = await this.findTokenData(hashedToken, 'primary');
    if (primaryToken) {
      return primaryToken;
    }

    return this.findTokenData(hashedToken, 'resume');
  }
}
