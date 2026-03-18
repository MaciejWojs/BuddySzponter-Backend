import { en } from './en';
import { pl } from './pl';

export const supportedLocales = ['en', 'pl'] as const;

export const locales = {
  en,
  pl,
} as const;

export type SupportedLocale = (typeof supportedLocales)[number];
