import { createHash } from 'crypto';

import { localesClient } from '@/infrastucture/s3/client';

import { ICoreRepository } from '../../domain/repositories/ICoreRepository';

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
    const hash = createHash('sha256').update(input.buffer).digest('hex');

    const safeVersion = input.version.trim();
    if (!/^\d+\.\d+\.\d+$/.test(safeVersion)) {
      throw new Error('Invalid version format. Expected x.y.z');
    }

    const versionExists = await this.coreRepository.hasVersion(safeVersion);
    if (!versionExists) {
      throw new Error(`App version '${safeVersion}' not found`);
    }

    const objectName = `${safeVersion}/${input.lang}/${hash}.json`;

    await localesClient.write(objectName, input.buffer);

    const updated = await this.coreRepository.updateLangHashByVersion(
      safeVersion,
      hash,
    );

    if (!updated) {
      throw new Error(`App version '${safeVersion}' not found`);
    }

    return {
      hash,
      fileUrl: localesClient.file(objectName),
      version: safeVersion,
      lang: input.lang,
    };
  }
}
