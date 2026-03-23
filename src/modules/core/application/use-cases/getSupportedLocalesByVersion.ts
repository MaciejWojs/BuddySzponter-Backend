import { localesClient } from '@/infrastucture/s3/client';
import { supportedLocales } from '@/shared/locales';

import { ICoreRepository } from '../../domain/repositories/ICoreRepository';

export class GetSupportedLocalesByVersion {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(version: string): Promise<(typeof supportedLocales)[number][]> {
    const safeVersion = version.trim();

    const exists = await this.coreRepository.hasVersion(safeVersion);
    if (!exists) {
      throw new Error(`App version '${safeVersion}' not found`);
    }

    const hash = await this.coreRepository.getLangHashByVersion(safeVersion);
    if (!hash) {
      return [];
    }

    const available = await Promise.all(
      supportedLocales.map(async (lang) => {
        const objectName = `${safeVersion}/${lang}/${hash}.json`;
        const fileExists = await localesClient.file(objectName).exists();
        return fileExists ? lang : null;
      }),
    );

    return available.filter(
      (lang): lang is (typeof supportedLocales)[number] => lang !== null,
    );
  }
}
