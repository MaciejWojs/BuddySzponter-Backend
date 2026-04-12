import { APP_CONFIG } from '@/config/appConfig';
import { client } from '@/infrastucture/cache/client';
import { ConnectionMapper } from '@/shared/mappers/connectionMapper';

import { Connection } from '../../domain/entities/Connection.entity';
import { ConnectionCodeAlreadyExistsError } from '../../domain/error/ConnectionBusinessErrors';
import { IConnectionRepository } from '../../domain/repositories/IConnectionRepository';
import { ConnectionCode, ConnectionStatus } from '../../domain/value-objects';

export class ConnectionRepository implements IConnectionRepository {
  async createPendingConnection(connection: Connection): Promise<Connection> {
    if (!client.connected) {
      throw new Error(
        'Cache client is not connected. Cannot create connection.'
      );
    }

    if (connection.guest) {
      throw new Error('Connection cannot have a guest to be pending.');
    }

    const payload = {
      status: connection.status.value,
      hostIpAddress: connection.host.ipAddress.value,
      hostDeviceId: connection.host.deviceId?.value ?? null,
      hostId: connection.host.userId?.value ?? null,
      password: connection.password.value,
      code: connection.code.value,
      connectionUUID: connection.id.value,
      hostFingerprint: connection.host.fingerprint.value,
      joinAttempts: connection.joinAttempts
    };
    let payloadData;
    try {
      payloadData = JSON.stringify(payload);
    } catch {
      throw new Error('Failed to serialize connection data.');
    }

    const key = `${APP_CONFIG.connection.cache.keys.codePrefix}${connection.code.value}`;
    const result = await client.setnx(key, payloadData);

    if (result !== 1) {
      throw new ConnectionCodeAlreadyExistsError();
    }
    const ttlResult = await client.expire(
      key,
      APP_CONFIG.connection.cache.ttl.pendingCodeSeconds
    );
    if (ttlResult !== 1) {
      await client.del(key);
      throw new Error('Failed to set connection expiration. Please try again.');
    }
    const lookupResult = await client.setex(
      `${APP_CONFIG.connection.cache.keys.uuidPrefix}${connection.id.value}`,
      APP_CONFIG.connection.cache.ttl.pendingCodeSeconds,
      connection.code.value
    );
    if (lookupResult !== 'OK') {
      await client.del(key);
      throw new Error('Failed to set connection lookup. Please try again.');
    }
    return connection;
  }

  async deleteConnection(id: string): Promise<boolean> {
    if (!client.connected) {
      throw new Error(
        'Cache client is not connected. Cannot delete connection.'
      );
    }
    const uuidKey = `${APP_CONFIG.connection.cache.keys.uuidPrefix}${id}`;
    const code = await client.get(uuidKey);

    if (code) {
      const codeKey = `${APP_CONFIG.connection.cache.keys.codePrefix}${code}`;
      const attemptsKey = `${APP_CONFIG.connection.cache.keys.attemptsPrefix}${code}`;
      const delResult = await client.del(uuidKey, codeKey, attemptsKey);
      return delResult > 0;
    }

    const delResult = await client.del(uuidKey);
    return delResult > 0;
  }

  async findByCode(code: ConnectionCode): Promise<Connection | null> {
    if (!client.connected) {
      throw new Error(
        'Cache client is not connected. Cannot retrieve connection.'
      );
    }
    const key = `${APP_CONFIG.connection.cache.keys.codePrefix}${code.value}`;
    const connectionDataRaw = await client.get(key);
    if (!connectionDataRaw) {
      return null;
    }
    let connectionData;
    try {
      connectionData = JSON.parse(connectionDataRaw);
    } catch {
      throw new Error('Failed to parse connection data from cache.');
    }
    return ConnectionMapper.toDomain(connectionData);
  }

  async findByStatus(status: ConnectionStatus): Promise<Connection[]> {
    if (!client.connected) {
      throw new Error(
        'Cache client is not connected. Cannot retrieve connections.'
      );
    }
    const keys = await client.keys(
      `${APP_CONFIG.connection.cache.keys.codePrefix}*`
    );
    const connections: Connection[] = [];
    for (const key of keys) {
      const connectionDataRaw = await client.get(key);
      if (!connectionDataRaw) {
        continue;
      }
      let connectionData;
      try {
        connectionData = JSON.parse(connectionDataRaw);
      } catch {
        continue; // Skip entries that fail to parse
      }
      if (connectionData.status === status.value) {
        connections.push(ConnectionMapper.toDomain(connectionData));
      }
    }
    return connections;
  }

  async updateConnection(connection: Connection): Promise<boolean> {
    if (!client.connected) {
      throw new Error(
        'Cache client is not connected. Cannot update connection.'
      );
    }
    const key = `${APP_CONFIG.connection.cache.keys.codePrefix}${connection.code.value}`;
    const existingDataRaw = await client.get(key);
    if (!existingDataRaw) {
      return false; // Connection does not exist
    }
    // let existingData;
    // try {
    //   existingData = JSON.parse(existingDataRaw);
    // } catch {
    //   throw new Error('Failed to parse existing connection data from cache.');
    // }

    const payload = {
      status: connection.status.value,
      hostIpAddress: connection.host.ipAddress.value,
      hostDeviceId: connection.host.deviceId?.value ?? null,
      hostId: connection.host.userId?.value ?? null,
      password: connection.password.value,
      code: connection.code.value,
      connectionUUID: connection.id.value,
      hostFingerprint: connection.host.fingerprint.value,
      guestIpAddress: connection.guest?.ipAddress.value ?? null,
      guestDeviceId: connection.guest?.deviceId?.value ?? null,
      guestId: connection.guest?.userId?.value ?? null,
      guestFingerprint: connection.guest?.fingerprint.value ?? null,
      joinAttempts: connection.joinAttempts
    };
    let payloadData;
    try {
      payloadData = JSON.stringify(payload);
    } catch {
      throw new Error('Failed to serialize connection data for cache update.');
    }
    const updatedDataStatus = await client.set(key, payloadData);
    return updatedDataStatus === 'OK';
  }
}
