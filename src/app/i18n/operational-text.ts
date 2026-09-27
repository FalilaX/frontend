import { useCallback } from 'react';
import { translate, useLanguage } from './language';
import { operationalMessages } from './operational-messages';
import { operatorMessages } from './operator-messages';
import { messages } from './messages';

// Only controlled UI labels call labelText. Names, notes and evidence do not.
const labelKeys = new Map(Object.keys({ ...messages, ...operatorMessages, ...operationalMessages })
  .map(key => [key.toLowerCase(), key]));
export function useOperationalText() {
  const { locale } = useLanguage();
  const t = useCallback((key: string, values?: Record<string, string | number>) => {
    const text = translate(key, locale);
    return values ? text.replace(/\{([a-zA-Z]+)\}/g, (token, name) =>
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : token) : text;
  }, [locale]);
  const labelText = useCallback((value: string | null | undefined) => {
    if (value == null) return '';
    if (locale === 'en') return value;
    // Local workflow notices retain their canonical English state until display,
    // so changing language also updates a notice that is already on screen.
    const patterns: Array<[RegExp, string, string[]]> = [
      [/^Opened retained (.+) revision (\d+)\.$/, 'Opened retained {type} revision {revision}.', ['type', 'revision']],
      [/^No evidence change detected\. Opened retained (.+) revision (\d+)\.$/, 'No evidence change detected. Opened retained {type} revision {revision}.', ['type', 'revision']],
      [/^No evidence change detected\. Downloaded retained Evidence JSON revision (\d+)\.$/, 'No evidence change detected. Downloaded retained Evidence JSON revision {revision}.', ['revision']],
      [/^(.+) (persisted|reused) as revision (\d+)\.$/, '{type} {state} as revision {revision}.', ['type', 'state', 'revision']],
      [/^Request failed \((\d+)\)$/, 'Request failed ({status})', ['status']],
      [/^Readiness service returned (\d+)\.$/, 'Readiness service returned {status}.', ['status']],
      [/^Site details are unavailable \((\d+)\)\.$/, 'Site details are unavailable ({status}).', ['status']],
    ];
    for (const [pattern, template, fields] of patterns) {
      const match = value.match(pattern);
      if (match) {
        const values = Object.fromEntries(fields.map((field, index) => [field, translate(match[index + 1], locale)]));
        return translate(template, locale).replace(/\{([a-zA-Z]+)\}/g, (token, field) => values[field] ?? token);
      }
    }
    const key = labelKeys.get(value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase());
    return translate(key ?? value, locale);
  }, [locale]);
  const dateText = useCallback((value: string | null | undefined) => {
    if (!value) return t('Not available');
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale);
  }, [locale, t]);
  const numberText = useCallback((value: number | null | undefined, digits = 1) =>
    typeof value === 'number' && Number.isFinite(value)
      ? value.toLocaleString(locale, { maximumFractionDigits: digits })
      : t('Not available'), [locale, t]);
  return { t, labelText, locale, dateText, numberText };
}
