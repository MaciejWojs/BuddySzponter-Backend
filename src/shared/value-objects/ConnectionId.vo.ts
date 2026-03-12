import { ConnectionIdError } from "@/modules/connection/domain/error/ConnectionIdError";

export class ConnectionId {
  constructor(private id: number) {
    if (id <= 0) {
      throw new ConnectionIdError(id);
    }
  }

  get value(): number {
    return this.id;
  }
}
