import type { Locale } from '@opentask/contracts/me/profile';
import { createContext, useContext } from 'react';
import type { MessageKey } from '../constants/messages';

export type MessageVars = Record<string, string | number>;

export interface I18n {
  locale: Locale;
  setLocale(locale: Locale): void;
  t(key: MessageKey, vars?: MessageVars): string;
  errorMessage(error: unknown): string;
  formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string;
  fieldError(field: string, error?: { type?: unknown; message?: string }): string | undefined;
}

export const I18nContext = createContext<I18n | null>(null);

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé dans <I18nProvider>');
  return ctx;
}
