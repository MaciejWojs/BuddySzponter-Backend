import { AppVersion } from '../../domain/entities/AppVersion.entity';
import { ICoreRepository } from '../../domain/repositories/ICoreRepository';

export interface CreateAppVersionInput {
  version: string;
  codename?: string | null;
  isSupported?: boolean;
}

export class CreateAppVersion {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(input: CreateAppVersionInput): Promise<AppVersion> {
    const normalizedVersion = input.version.trim();

    const alreadyExists =
      await this.coreRepository.hasVersion(normalizedVersion);
    if (alreadyExists) {
      throw new Error(`App version '${normalizedVersion}' already exists`);
    }

    return this.coreRepository.createVersion({
      version: normalizedVersion,
      codename: input.codename ?? null,
      isSupported: input.isSupported ?? true,
    });
  }
}
