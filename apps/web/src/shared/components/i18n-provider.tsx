import type { Locale } from '@opentask/contracts/me/profile';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { type MessageKey, en, fr } from '../constants/messages';
import { type I18n, I18nContext, type MessageVars } from '../hooks/useI18n';
import { ApiRequestError } from '../utils/api-client';

const dictionaries: Record<Locale, Record<MessageKey, string>> = { fr, en };
const STORAGE_KEY = 'opentask.locale';

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {
    return 'fr';
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')
    ? 'en'
    : 'fr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      return;
    }
  }, []);

  const value = useMemo<I18n>(() => {
    const t = (key: MessageKey, vars?: MessageVars) => {
      const template = dictionaries[locale][key] ?? fr[key];
      return vars
        ? template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
        : template;
    };
    return {
      locale,
      setLocale,
      t,
      errorMessage(error) {
        if (!(error instanceof ApiRequestError)) return t('error.INTERNAL_ERROR');
        if (error.status === 0) return t('error.network');
        const code = error.code.startsWith('USER_ALREADY_EXISTS')
          ? 'USER_ALREADY_EXISTS'
          : error.code;
        const key = `error.${code}` as MessageKey;
        if (key in fr) return t(key);
        return error.message || t('error.INTERNAL_ERROR');
      },
      fieldError(field, error) {
        if (!error) return undefined;
        if (error.type === 'invalid_format')
          return t(field === 'email' ? 'validation.email' : 'validation.invalid');
        if (error.type === 'too_small')
          return t(/password/i.test(field) ? 'validation.password' : 'validation.required');
        if (error.type === 'too_big') return t('validation.tooLong');
        return locale === 'fr' && error.message ? error.message : t('validation.invalid');
      },
      formatDate(iso, options = { dateStyle: 'medium', timeStyle: 'short' }) {
        return new Intl.DateTimeFormat(locale, options).format(new Date(iso));
      },
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
