import { localesClient } from '@/infrastucture/s3/client';

import { ICoreRepository } from '../../domain/repositories/ICoreRepository';
import { Version } from '../../domain/value-objects/version.vo';

export interface UploadLocaleInput {
  buffer: Buffer;
  lang: string;
  version: string;
}

export interface UploadLocaleResult {
  hash: string;
  fileUrl: ReturnType<typeof localesClient.file>;
  version: string;
  lang: string;
}

export class UploadLocale {
  constructor(private readonly coreRepository: ICoreRepository) {}

  async execute(input: UploadLocaleInput): Promise<UploadLocaleResult> {
    const safeVersion = new Version(input.version);

    const versionExists = await this.coreRepository.findByVersion(safeVersion);
    if (!versionExists) {
      throw new Error(`App version '${safeVersion}' not found`);
    }

    const objectName = `${versionExists.version.value}/${input.lang}/${versionExists.langHash}.json`;

    await localesClient.write(objectName, input.buffer);

    return {
      hash: versionExists.langHash,
      fileUrl: localesClient.file(objectName),
      version: safeVersion.value,
      lang: input.lang,
    };
  }
}
