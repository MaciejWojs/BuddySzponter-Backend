import { createHash, randomBytes } from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { resize, stripExif, toWebp } from 'imgkit';

import { photosClient } from '@/infrastucture/s3/client';
import { UserId } from '@/shared/value-objects';

import { IUserRepository } from '../../domain/repositories/IUserRepository';

type SupportedMime = 'image/png' | 'image/jpeg' | 'image/webp';

export class PostUserAvatar {
  constructor(private readonly userRepository: IUserRepository) {}

  private async detectMimeFromBuffer(
    buffer: Buffer,
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

  private async stripMetadata(
    buffer: Buffer,
    mime: SupportedMime,
  ): Promise<Buffer> {
    if (mime == 'image/png') {
      return toWebp(buffer);
    }

    if (mime === 'image/webp') {
      const stripped = await stripExif(buffer);
      return stripped;
    }

    const stripped = await stripExif(buffer);
    return toWebp(stripped);
  }

  private async encodeByMime(buffer: Buffer): Promise<Buffer> {
    return toWebp(buffer);
  }

  async execute(
    userId: number,
    fileBuffer: Buffer,
    mime: SupportedMime,
  ): Promise<{ avatar: string; hash: string }> {
    try {
      const detectedMime = await this.detectMimeFromBuffer(fileBuffer);

      if (!detectedMime || detectedMime !== mime) {
        throw new Error(
          'Plik uszkodzony lub niezgodny z deklarowanym formatem.',
        );
      }
    } catch {
      throw new Error(
        'Nie można przetworzyć pliku. Upewnij się, że jest to poprawny obraz PNG, JPEG lub WEBP.',
      );
    }
    const name = randomBytes(16).toString('hex');

    // original (full image, only metadata stripped)
    const original = await this.stripMetadata(fileBuffer, mime);

    // hash as avatar id in DB
    const hash = createHash('sha256').update(original).digest('hex');

    const ext = 'webp';

    // resized variants
    const sizes = [128, 256, 512];
    const resizeTasks = sizes.map(async (size) => {
      const resized = await resize(original, {
        width: size,
        height: size,
        fit: 'cover', // fill square
      });
      const encoded = await this.encodeByMime(resized);
      await photosClient.write(`${name}/${size}.${ext}`, encoded);
    });

    // original
    const originalTask = photosClient.write(
      `${name}/original.${ext}`,
      original,
    );

    await Promise.all([...resizeTasks, originalTask]);

    // DB avatar = hash (as requested)
    const user = await this.userRepository.findById(new UserId(userId));
    const updated = user.updateAvatar(hash);
    await this.userRepository.updateUser(updated);

    return { avatar: hash, hash };
  }
}
