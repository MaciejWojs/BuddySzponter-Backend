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
    usersTable: {
      count: 10,
    },
    rolesTable: {
      count: 3,
      columns: {
        name: f.valuesFromArray({
          values: ['ADMIN', 'USER', 'SUPERADMIN'],
          isUnique: true,
        }),
      },
    },
    userRolesTable: {
      count: 10,
      columns: {
        userId: f.valuesFromArray({
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          isUnique: true,
        }),
        roleId: f.valuesFromArray({ values: [1, 2, 3] }),
      },
    },
  }));
}

main();
