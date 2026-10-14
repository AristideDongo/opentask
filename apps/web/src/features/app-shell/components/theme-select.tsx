import { useState } from 'react';
import { useI18n } from '../../../shared/hooks/useI18n';
import { type ThemePreference, applyTheme, readTheme } from '../../../shared/utils/theme';

export function ThemeSelect() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<ThemePreference>(readTheme);
  return (
    <label className="flex flex-1 items-center gap-1.5 text-sm text-muted">
      <span className="sr-only">{t('nav.theme')}</span>
      <select
        value={theme}
        onChange={(e) => {
          const next = e.target.value as ThemePreference;
          setTheme(next);
          applyTheme(next);
        }}
        className="h-8 w-full rounded-[var(--radius-control)] bg-transparent px-1.5 text-sm hover:bg-sunken"
      >
        <option value="system">{t('nav.theme.system')}</option>
        <option value="light">{t('nav.theme.light')}</option>
        <option value="dark">{t('nav.theme.dark')}</option>
      </select>
    </label>
  );
}
