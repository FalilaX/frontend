import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { chooseLocale, LANGUAGE_KEY, locales, readSavedLocale, supportedLocale } from './locale';
import type { Locale } from './locale';
import { messages } from './messages';
import { operationalMessages } from './operational-messages';
import { operatorMessages } from './operator-messages';

const names = { en: 'English', es: 'Español', fr: 'Français' };
export const LanguageContext = createContext<{ locale: Locale; select: (value: Locale) => void; adopt: (value: string) => void }>({ locale: 'en', select: () => {}, adopt: () => {} });
export const useLanguage = () => useContext(LanguageContext);
export function translate(text: string, locale: Locale): string {
  const key = text.replace(/\s+/g, ' ').trim();
  let translated = locale === 'en' ? undefined : (operationalMessages[key] ?? operatorMessages[key] ?? messages[key])?.[locale];
  if (!translated && locale !== 'en') {
    const patterns: Array<[RegExp, string, string]> = [
      [/^Requested within (\d+) minutes$/, 'Solicitada en un plazo de $1 minutos', 'Demandé dans un délai de $1 minutes'],
      [/^Configured after (\d+) minutes$/, 'Configurado después de $1 minutos', 'Configuré après $1 minutes'],
      [/^Try again in (\d+) seconds\.$/, 'Inténtelo de nuevo en $1 segundos.', 'Réessayez dans $1 secondes.'],
      [/^to (.+)$/, 'a $1', 'à $1'],
    ];
    for (const [pattern, es, fr] of patterns) if (pattern.test(key)) { translated = key.replace(pattern, locale === 'es' ? es : fr); break; }
  }
  return translated ? text.replace(/\S[\s\S]*\S|\S/, () => translated!) : text;
}
// Translate only explicit UI strings. Unknown names, records and server content remain unchanged.
export function Localize({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  return <>{typeof children === 'string' ? translate(children, locale) : children}</>;
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const publicFlow = pathname === '/' || pathname === '/join/water-demo' || pathname === '/enroll' || pathname.startsWith('/enroll/') || pathname === '/participant/sign-in' || pathname === '/operator/sign-in';
  const [locale, setLocale] = useState<Locale>(() => chooseLocale(readSavedLocale(), typeof navigator === 'undefined' ? [] : navigator.languages));
  const explicitChoice = useRef(Boolean(readSavedLocale()));
  const select = useCallback((value: Locale) => {
    if (!locales.includes(value)) return;
    explicitChoice.current = true;
    setLocale(value);
    try { window.localStorage.setItem(LANGUAGE_KEY, value); } catch { /* Choice still works for this page session. */ }
  }, []);
  const adopt = useCallback((value: string) => {
    const language = supportedLocale(value);
    if (!explicitChoice.current && language) setLocale(language);
  }, []);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === LANGUAGE_KEY || event.key === null) {
        explicitChoice.current = Boolean(readSavedLocale());
        setLocale(chooseLocale(readSavedLocale(), navigator.languages));
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);
  useEffect(() => { if (publicFlow) document.documentElement.lang = locale; }, [locale, publicFlow]);
  return <LanguageContext.Provider value={{ locale, select, adopt }}>
    {publicFlow && <LanguageToolbar />}
    {children}
  </LanguageContext.Provider>;
}

export function LanguageToolbar() {
  const { locale, select } = useLanguage();
  return (    <div className="border-b border-white/10 bg-[#071b2a] px-5 py-3 text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm" htmlFor="falilax-language">
          <Localize>Language</Localize>
          <select id="falilax-language" value={locale} onChange={event => select(event.target.value as Locale)} className="rounded-lg border border-cyan-300/30 bg-[#071b2a] px-3 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
            {locales.map(value => <option key={value} value={value} lang={value}>{names[value]}</option>)}
          </select>
        </label>
        {locale !== 'en' && <p className="max-w-2xl text-xs leading-5 text-slate-300" role="status"><Localize>Original records and retained reports remain in their original language.</Localize></p>}
      </div>
    </div>
  );
}
