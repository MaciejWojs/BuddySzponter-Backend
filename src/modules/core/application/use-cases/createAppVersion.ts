import { randomBytes } from 'crypto';

import { AppVersion } from '../../domain/entities/AppVersion.entity';
import { ICoreRepository } from '../../domain/repositories/ICoreRepository';
import { AppVersionUUID } from '../../domain/value-objects/appVersionUUID.vo';
import { Version } from '../../domain/value-objects/version.vo';

export interface CreateAppVersionInput {
  version: string;
  codename?: string | null;
  isSupported: boolean;
}

export class CreateAppVersion {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(input: CreateAppVersionInput): Promise<AppVersion> {
    const normalizedVersion = input.version.trim();

    const langHash = randomBytes(16).toString('hex');
    const newVersion = new AppVersion(
      new AppVersionUUID(),
      new Version(normalizedVersion),
      input.codename ?? null,
      input.isSupported,
      langHash,
    );

    const alreadyExists = await this.coreRepository.findByVersion(
      newVersion.version,
    );
    if (alreadyExists) {
      throw new Error(`App version '${normalizedVersion}' already exists`);
    }

    return this.coreRepository.createVersion(newVersion);
  }
}
