import { ICoreDao } from '@/modules/core/infrastructure/dao/ICoreDao';

import { GetVersionsQuery } from '../../api/schemas/versions.request.schema';
import { VersionResponse } from '../../api/schemas/versions.response.schema';

export class GetVersions {
  constructor(private readonly coreDao: ICoreDao) {}

  async execute(query: GetVersionsQuery): Promise<VersionResponse[]> {
    const hasFilters =
      query.version !== undefined ||
      query.codename !== undefined ||
      query.isSupported !== undefined;

    const rows = hasFilters
      ? await this.coreDao.findManyFiltered(query)
      : await this.coreDao.findMany(query.offset, query.limit);

    return rows.map((row) => ({
      id: row.id,
      version: row.version,
      codename: row.codename,
      isSupported: row.isSupported,
      langHash: row.langHash
    }));
  }
}
