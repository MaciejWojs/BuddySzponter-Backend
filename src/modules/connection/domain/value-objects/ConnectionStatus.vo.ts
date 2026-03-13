// This file defines the ConnectionStatus value object, which relates to the status of a connection between a guest and a host. Does not go into the database, only used in the domain layer to represent the status of a connection. Only does matter cache layer (Valkey)
export class ConnectionStatus {
  constructor(private status: string) {
    if (status.trim().length === 0) {
      throw new Error('ConnectionStatus cannot be empty');
    }
  }

  get value(): string {
    return this.status;
  }
}
