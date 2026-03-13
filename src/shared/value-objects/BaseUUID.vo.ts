import z from 'zod';

export class BaseUUID {
  constructor(private id: string = crypto.randomUUID()) {
    const res = z.uuid().safeParse(id);
    if (!res.success) {
      throw new Error('Invalid UUID');
    }
  }
  get value(): string {
    return this.id;
  }
}
