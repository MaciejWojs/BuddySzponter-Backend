import ISO6391 from 'iso-639-1';

import { localesClient } from '@/infrastucture/s3/client';

const getManifestObjectName = (version: string, hash: string) =>
  `${version}/_meta/${hash}.json`;

const normalizeLocaleCode = (value: string): string | null => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (!ISO6391.validate(normalized)) {
    return null;
  }

  return normalized;
};

const normalizeLocaleList = (locales: string[]): string[] =>
  Array.from(
    new Set(
      locales
        .map(normalizeLocaleCode)
        .filter((lang): lang is string => lang !== null)
    )
  );

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

    const rawLocales = parsed.filter(
      (value): value is string => typeof value === 'string'
    );

    return normalizeLocaleList(rawLocales);
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
  const normalized = normalizeLocaleList(locales);

  await localesClient.write(objectName, JSON.stringify(normalized));
}

export async function addLocaleToManifest(
  version: string,
  hash: string,
  lang: string
): Promise<void> {
  const locales = await getLocalesManifest(version, hash);
  const normalizedLang = normalizeLocaleCode(lang);

  if (!normalizedLang) {
    return;
  }

  if (!locales.includes(normalizedLang)) {
    locales.push(normalizedLang);
    await setLocalesManifest(version, hash, locales);
  }
}

export async function removeLocaleFromManifest(
  version: string,
  hash: string,
  lang: string
): Promise<void> {
  const locales = await getLocalesManifest(version, hash);
  const normalizedLang = normalizeLocaleCode(lang);

  if (!normalizedLang) {
    return;
  }

  const filtered = locales.filter((item) => item !== normalizedLang);
  await setLocalesManifest(version, hash, filtered);
}
