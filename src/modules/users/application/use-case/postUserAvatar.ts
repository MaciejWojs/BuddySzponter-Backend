import { randomBytes } from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { resize, stripExif, toWebp } from 'imgkit';

import { photosClient } from '@/infrastucture/s3/client';
import { UserId } from '@/shared/value-objects';

import { IUserRepository } from '../../domain/repositories/IUserRepository';

type SupportedMime = 'image/png' | 'image/jpeg' | 'image/webp';

export class PostUserAvatar {
  constructor(private readonly userRepository: IUserRepository) {}

  private async detectMimeFromBuffer(
    buffer: Buffer
  ): Promise<SupportedMime | null> {
    const result = await fileTypeFromBuffer(buffer);
    if (!result) return null;

    if (
      result.mime === 'image/png' ||
      result.mime === 'image/jpeg' ||
      result.mime === 'image/webp'
    ) {
      return result.mime;
    }

    return null;
  }

  private async encodeByMime(buffer: Buffer): Promise<Buffer> {
    return toWebp(buffer);
  }

  async execute(
    userId: number,
    fileBuffer: Buffer,
    mime: SupportedMime
  ): Promise<{ avatar: string }> {
    try {
      const detectedMime = await this.detectMimeFromBuffer(fileBuffer);

      if (!detectedMime || detectedMime !== mime) {
        throw new Error(
          'File is corrupted or does not match the declared format.'
        );
      }
    } catch {
      throw new Error(
        'Unable to process file. Ensure it is a valid PNG, JPEG, or WEBP image.'
      );
    }
    const name = randomBytes(16).toString('hex');

    // original (full image, only metadata stripped)
    const original = await this.stripMetadata(fileBuffer, mime);

    const ext = 'webp';

    // resized variants
    const sizes = [128, 256, 512];
    const resizeTasks = sizes.map(async (size) => {
      const resized = await resize(original, {
        width: size,
        height: size,
        fit: 'cover' // fill square
      });
      const encoded = await this.encodeByMime(resized);
      await photosClient.write(`${name}/${size}.${ext}`, encoded);
    });

    // original
    const originalTask = photosClient.write(
      `${name}/original.${ext}`,
      original
    );

    // DB avatar = hash (as requested)
    const user = await this.userRepository.findById(new UserId(userId));
    const deleteTasks = [];
    if (user.avatar) {
      deleteTasks.push(
        ...sizes.map((size) =>
          photosClient.delete(`${user.avatar}/${size}.${ext}`)
        )
      );
      deleteTasks.push(photosClient.delete(`${user.avatar}/original.${ext}`));
    }
    await Promise.all([...resizeTasks, originalTask, ...deleteTasks]);
    const updated = user.updateAvatar(name);
    await this.userRepository.updateUser(updated);

    return { avatar: name };
  }

  private async stripMetadata(
    buffer: Buffer,
    mime: SupportedMime
  ): Promise<Buffer> {
    if (mime === 'image/png') {
      return toWebp(buffer);
    }

    if (mime === 'image/webp') {
      return stripExif(buffer);
    }

    const stripped = await stripExif(buffer);
    return toWebp(stripped);
  }
}
