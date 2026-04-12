import { S3Client } from 'bun';

import { configProvider } from '../../config/configProvider';

const avatarBucket = 'photos';
const localesBucket = 'locales';

export const photosClient = new S3Client({
  endpoint: configProvider.get('MINIO_ENDPOINT'),
  accessKeyId: configProvider.get('MINIO_ROOT_USER'),
  secretAccessKey: configProvider.get('MINIO_ROOT_PASSWORD'),
  bucket: avatarBucket
});

export const localesClient = new S3Client({
  endpoint: configProvider.get('MINIO_ENDPOINT'),
  accessKeyId: configProvider.get('MINIO_ROOT_USER'),
  secretAccessKey: configProvider.get('MINIO_ROOT_PASSWORD'),
  bucket: localesBucket
});
