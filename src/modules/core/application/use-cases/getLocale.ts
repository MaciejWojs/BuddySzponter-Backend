import { localesClient } from '@/infrastucture/s3/client';

import { ICoreRepository } from '../../domain/repositories/ICoreRepository';

export class GetLocale {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(lang: string, version: string) {
    const safeVersion = version.trim();
    const safeLang = lang.trim();

    const hash = await this.coreRepository.getLangHashByVersion(safeVersion);
    if (!hash) {
      return null;
    }

    const objectName = `${safeVersion}/${safeLang}/${hash}.json`;
    const file = localesClient.file(objectName);

    try {
      const content = await file.text();
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}
