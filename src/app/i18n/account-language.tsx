import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { LanguageContext, LanguageToolbar, useLanguage } from './language';
import { supportedLocale } from './locale';
import type { Locale } from './locale';

export type LanguageAccount =
  | { kind: 'operator'; userId: number }
  | { kind: 'participant'; organizationId: number; subscriberId: number };

export function accountLanguageKey(account: LanguageAccount): string {
  const ids = account.kind === 'operator' ? [account.userId] : [account.organizationId, account.subscriberId];
  if (!ids.every(id => Number.isSafeInteger(id) && id > 0)) throw new Error('A verified account identity is required.');
  return `falilax.language.v2.${account.kind}.${ids.join('.')}`;
}
function savedLanguage(key: string): Locale | null {
  try { return supportedLocale(window.localStorage.getItem(key)); } catch { return null; }
}
const ignoreProfileRefresh = () => {};

// Mount only inside an authenticated guard. This preference grants no access.
export function AccountLanguageProvider({ account, defaultLanguage, children }: {
  account: LanguageAccount; defaultLanguage?: string; children: ReactNode;
}) {
  const { locale: visitorLocale } = useLanguage();
  const storageKey = accountLanguageKey(account);
  return <ScopedLanguage key={storageKey} storageKey={storageKey} defaultLanguage={supportedLocale(defaultLanguage) ?? visitorLocale}>{children}</ScopedLanguage>;
}
function ScopedLanguage({ storageKey, defaultLanguage, children }: {
  storageKey: string; defaultLanguage: Locale; children: ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(() => savedLanguage(storageKey) ?? defaultLanguage);
  const select = useCallback((value: Locale) => {
    const next = supportedLocale(value);
    if (!next) return;
    setLocale(next);
    try { window.localStorage.setItem(storageKey, next); } catch { /* Remains active in this mounted workspace. */ }
  }, [storageKey]);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) setLocale(savedLanguage(storageKey) ?? defaultLanguage);
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, [storageKey, defaultLanguage]);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return <LanguageContext.Provider value={{ locale, select, adopt: ignoreProfileRefresh }}>
    <LanguageToolbar />
    {children}
  </LanguageContext.Provider>;
}
