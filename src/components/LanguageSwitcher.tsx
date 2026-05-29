'use client';

import { useI18n } from '@/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 rounded ${locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('zh')}
        className={`px-3 py-1 rounded ${locale === 'zh' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        中文
      </button>
    </div>
  );
}