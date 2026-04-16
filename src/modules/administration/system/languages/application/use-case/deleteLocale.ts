import { localesClient } from '@/infrastucture/s3/client';
import { removeLocaleFromManifest } from '@/modules/core/application/use-cases/localesManifest';
import { ICoreRepository } from '@/modules/core/domain/repositories/ICoreRepository';
import { Version } from '@/modules/core/domain/value-objects/version.vo';

export class DeleteLocale {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(version: string, lang: string): Promise<void> {
    const safeVersion = new Version(version.trim());
    const versionExists = await this.coreRepository.findByVersion(safeVersion);

    if (!versionExists) {
      throw new Error(`App version '${safeVersion.value}' not found`);
    }

    const hash = await this.coreRepository.getLangHashByVersion(
      safeVersion.value
    );
    if (!hash) {
      throw new Error('Locale not found');
    }

    const objectName = `${safeVersion.value}/${lang}/${hash}.json`;
    const exists = await localesClient.file(objectName).exists();

    if (!exists) {
      throw new Error('Locale not found');
    }

    await localesClient.delete(objectName);
    await removeLocaleFromManifest(safeVersion.value, hash, lang);
  }
}
