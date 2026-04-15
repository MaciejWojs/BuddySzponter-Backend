import { localesClient } from '@/infrastucture/s3/client';

const getManifestObjectName = (version: string, hash: string) =>
  `${version}/_meta/${hash}.json`;

export async function getLocalesManifest(
  version: string,
  hash: string
): Promise<string[]> {
  const objectName = getManifestObjectName(version, hash);
  const file = localesClient.file(objectName);

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => value.length > 0);
  } catch {
    return [];
  }
}

export async function setLocalesManifest(
  version: string,
  hash: string,
  locales: string[]
): Promise<void> {
  const objectName = getManifestObjectName(version, hash);
  const normalized = Array.from(
    new Set(
      locales.map((lang) => lang.trim()).filter((lang) => lang.length > 0)
    )
  );

  await localesClient.write(objectName, JSON.stringify(normalized));
}

export async function addLocaleToManifest(
  version: string,
  hash: string,
  lang: string
): Promise<void> {
  const locales = await getLocalesManifest(version, hash);

  if (!locales.includes(lang)) {
    locales.push(lang);
    await setLocalesManifest(version, hash, locales);
  }
}

export async function removeLocaleFromManifest(
  version: string,
  hash: string,
  lang: string
): Promise<void> {
  const locales = await getLocalesManifest(version, hash);
  const filtered = locales.filter((item) => item !== lang);
  await setLocalesManifest(version, hash, filtered);
}
