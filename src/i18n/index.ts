import { en } from './en';
import { zh } from './zh';
import { zhTW } from './zh-TW';
import { ja } from './ja';
import { ko } from './ko';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';
import { pt } from './pt';
import { ru } from './ru';
import { ar } from './ar';
import { hi } from './hi';
import { vi } from './vi';
import { th } from './th';
import { id } from './id';

export type Language = 'en' | 'zh' | 'zh-TW' | 'ja' | 'ko' | 'de' | 'fr' | 'es' | 'pt' | 'ru' | 'ar' | 'hi' | 'vi' | 'th' | 'id';

type TranslationKey = keyof typeof en;

const translations: Record<Language, Record<string, string>> = {
  en,
  zh,
  'zh-TW': zhTW,
  ja,
  ko,
  de,
  fr,
  es,
  pt,
  ru,
  ar,
  hi,
  vi,
  th,
  id,
};

const languagePriority: Language[] = ['en', 'zh', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'hi', 'vi', 'th', 'id'];

export function detectLanguage(acceptLanguage: string | null): Language {
  if (!acceptLanguage) return 'en';

  const header = acceptLanguage.toLowerCase();
  const parts = header.split(',').map(part => {
    const [lang, q = 'q=1'] = part.trim().split(';');
    const quality = parseFloat(q.replace('q=', '')) || 1;
    return { lang: lang.trim(), quality };
  });

  parts.sort((a, b) => b.quality - a.quality);

  for (const { lang } of parts) {
    for (const langCode of languagePriority) {
      if (lang.startsWith(langCode) || lang.split('-')[0] === langCode.split('-')[0]) {
        return langCode;
      }
    }
  }

  return 'en';
}

export function t(key: string, locale: Language = 'en'): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

export function isRTL(locale: Language): boolean {
  return locale === 'ar';
}