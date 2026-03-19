import { locales, type SupportedLocale } from '@/shared/locales';

export class GetLocale {
  execute(lang: SupportedLocale) {
    return locales[lang];
  }
}
