import { en } from './en';
import { pl } from './pl';
import { plX67 } from './plX67';

export const supportedLocales = ['en', 'pl', 'plX67'] as const;

export const locales = {
  en,
  pl,
  plX67,
} as const;

export type SupportedLocale = (typeof supportedLocales)[number];
