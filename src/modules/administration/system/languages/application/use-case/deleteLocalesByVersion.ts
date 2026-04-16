import { localesClient } from '@/infrastucture/s3/client';
import {
  getLocalesManifest,
  setLocalesManifest
} from '@/modules/core/application/use-cases/localesManifest';
import { ICoreRepository } from '@/modules/core/domain/repositories/ICoreRepository';
import { Version } from '@/modules/core/domain/value-objects/version.vo';

export class DeleteLocalesByVersion {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(version: string): Promise<number> {
    const safeVersion = new Version(version.trim());
    const versionExists = await this.coreRepository.findByVersion(safeVersion);

    if (!versionExists) {
      throw new Error(`App version '${safeVersion.value}' not found`);
    }

    const hash = await this.coreRepository.getLangHashByVersion(
      safeVersion.value
    );
    if (!hash) {
      return 0;
    }

    const locales = await getLocalesManifest(safeVersion.value, hash);
    if (locales.length === 0) {
      return 0;
    }

    let deletedCount = 0;

    for (const lang of locales) {
      const objectName = `${safeVersion.value}/${lang}/${hash}.json`;
      const exists = await localesClient.file(objectName).exists();

      if (!exists) {
        continue;
      }

      await localesClient.delete(objectName);
      deletedCount += 1;
    }

    await setLocalesManifest(safeVersion.value, hash, []);

    return deletedCount;
  }
}
