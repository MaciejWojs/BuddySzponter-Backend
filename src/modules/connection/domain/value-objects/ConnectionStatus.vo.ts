// This file defines the ConnectionStatus value object, which relates to the status of a connection between a guest and a host. Does not go into the database, only used in the domain layer to represent the status of a connection. Only does matter cache layer (Valkey)
export class ConnectionStatus {
  public static ACTIVE = new ConnectionStatus('active');

  public static ENDED = new ConnectionStatus('ended');

  public static INACTIVE = new ConnectionStatus('inactive');

  public static PENDING = new ConnectionStatus('pending');

  private constructor(private status: string) {
    if (status.trim().length === 0) {
      throw new Error('ConnectionStatus cannot be empty');
    }
    this.status = status.toUpperCase();
  }

  public static fromString(status: string): ConnectionStatus {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return ConnectionStatus.ACTIVE;
      case 'INACTIVE':
        return ConnectionStatus.INACTIVE;
      case 'ENDED':
        return ConnectionStatus.ENDED;
      case 'PENDING':
        return ConnectionStatus.PENDING;
      default:
        throw new Error(`Invalid connection status: ${status}`);
    }
  }

  get value(): string {
    return this.status;
  }
}
