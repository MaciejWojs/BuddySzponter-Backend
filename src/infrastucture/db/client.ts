import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';

const sqlClient = new SQL(process.env.DATABASE_URL!);
export const db = drizzle({ client: sqlClient });
