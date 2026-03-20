import { en } from './en';
import { it } from './it';
import { pl } from './pl';
import { plX67 } from './plX67';

export const supportedLocales = ['en', 'pl', 'plX67', 'it'] as const;

export const locales = {
  en,
  pl,
  plX67,
  it,
} as const;

export type SupportedLocale = (typeof supportedLocales)[number];
