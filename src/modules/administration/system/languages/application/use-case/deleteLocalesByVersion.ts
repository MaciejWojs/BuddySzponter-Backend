import { localesClient } from '@/infrastucture/s3/client';
import { ICoreRepository } from '@/modules/core/domain/repositories/ICoreRepository';
import { Version } from '@/modules/core/domain/value-objects/version.vo';
import { supportedLocales } from '@/shared/locales';

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

    let deletedCount = 0;

    for (const lang of supportedLocales) {
      const objectName = `${safeVersion.value}/${lang}/${hash}.json`;
      const exists = await localesClient.file(objectName).exists();

      if (!exists) {
        continue;
      }

      await localesClient.delete(objectName);
      deletedCount += 1;
    }

    return deletedCount;
  }
}
