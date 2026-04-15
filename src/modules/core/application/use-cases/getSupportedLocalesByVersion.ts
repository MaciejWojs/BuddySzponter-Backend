import { ICoreRepository } from '../../domain/repositories/ICoreRepository';
import { Version } from '../../domain/value-objects/version.vo';
import { getLocalesManifest } from './localesManifest';

export class GetSupportedLocalesByVersion {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(version: string): Promise<string[]> {
    const safeVersion = version.trim();

    const versionVO = new Version(safeVersion);

    const exists = await this.coreRepository.findByVersion(versionVO);
    if (!exists) {
      throw new Error(`App version '${safeVersion}' not found`);
    }

    const hash = await this.coreRepository.getLangHashByVersion(safeVersion);
    if (!hash) {
      return [];
    }

    return getLocalesManifest(safeVersion, hash);
  }
}
