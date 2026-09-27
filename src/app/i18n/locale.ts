export const locales = ['en', 'es', 'fr'] as const;
export type Locale = typeof locales[number];
export const LANGUAGE_KEY = 'falilax.language.v1';
export function supportedLocale(value: unknown): Locale | null {
  if (typeof value !== 'string') return null;
  const base = value.trim().toLowerCase().replaceAll('_', '-').split('-')[0];
  return locales.includes(base as Locale) ? base as Locale : null;
}
export function chooseLocale(saved: unknown, browserLanguages: readonly string[]): Locale {
  if (locales.includes(saved as Locale)) return saved as Locale;
  for (const candidate of browserLanguages) {
    const language = supportedLocale(candidate);
    if (language) return language;
  }
  return 'en';
}
export function readSavedLocale(): Locale | null {
  try { const value = window.localStorage.getItem(LANGUAGE_KEY); return locales.includes(value as Locale) ? value as Locale : null; }
  catch { return null; }
}
