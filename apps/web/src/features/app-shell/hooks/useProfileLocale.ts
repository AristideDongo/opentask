import type { Locale } from '@opentask/contracts/me/profile';
import { useEffect } from 'react';
import { useI18n } from '../../../shared/hooks/useI18n';

export function useProfileLocale(profileLocale: Locale) {
  const { locale, setLocale } = useI18n();
  useEffect(() => {
    if (profileLocale !== locale) setLocale(profileLocale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLocale]);
}
