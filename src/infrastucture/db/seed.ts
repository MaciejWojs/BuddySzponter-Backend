import logger from '@logger';
import { env } from 'bun';
import { reset, seed } from 'drizzle-seed';

import { db } from './client';
import * as schema from './schema';

async function main() {
  const isDevelopment = env.DEVELOPMENT === 'true' || env.DEVELOPMENT === '1';

  if (!isDevelopment) {
    logger.warn(
      'Seeding is only allowed in development environment. Aborting.',
    );
    return;
  }

  logger.info('Resetting and seeding the database...');
  await reset(db, schema);
  await seed(db, schema).refine((f) => ({
    rolesTable: {
      count: 3,
      columns: {
        name: f.valuesFromArray({
          values: ['ADMIN', 'USER', 'SUPERADMIN'],
          isUnique: true,
        }),
      },
    },
    usersTable: {
      count: 10,
      columns: {
        roleId: f.valuesFromArray({
          values: [1, 2, 3],
        }),
      },
    },
  }));
}

if (require.main === module) {
  main().catch((error) => {
    logger.error('Database seeding failed', error);
    process.exit(1);
  });
}
