import { Connection } from '../entities/Connection.entity';
import { ConnectionCode, ConnectionStatus } from '../value-objects/';

export interface IConnectionRepository {
  createPendingConnection(connection: Connection): Promise<Connection>;
  findByCode(code: ConnectionCode): Promise<Connection | null>;
  findByStatus(status: ConnectionStatus): Promise<Connection[]>;
  updateConnection(connection: Connection): Promise<boolean>;
  deleteConnection(id: string): Promise<boolean>;
}
