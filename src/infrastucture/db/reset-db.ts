import logger from '@logger';
import { reset } from 'drizzle-seed';

import { db } from './client';
import * as schema from './schema';

async function main() {
  logger.info('Resetting the database...');
  await reset(db, schema);
}

if (require.main === module) {
  main().catch((error) => {
    logger.error('Database reset failed', error);
    process.exit(1);
  });
}
