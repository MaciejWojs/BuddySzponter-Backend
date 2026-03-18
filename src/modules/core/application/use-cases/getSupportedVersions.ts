import { AppVersion } from '../../domain/entities/AppVersion.entity';
import { ICoreRepository } from '../../domain/repositories/ICoreRepository';

export class GetSupportedVersions {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(): Promise<AppVersion[]> {
    return this.coreRepository.getSupportedVersions();
  }
}
