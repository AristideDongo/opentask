import { Check } from 'lucide-react';
import { Logo } from '../../../shared/components/logo';
import { SOURCE_URL, SourceLink } from '../../../shared/components/source-link';
import { useI18n } from '../../../shared/hooks/useI18n';
import { PRINCIPLES } from '../auth.const';

export function AuthAside() {
  const { t } = useI18n();
  return (
    <aside className="flex flex-col justify-between gap-10 border-b border-line bg-sunken px-6 py-8 sm:px-10 lg:border-r lg:border-b-0 lg:py-12">
      <div className="flex items-center gap-2.5">
        <Logo />
        <span className="text-lg font-bold">{t('app.name')}</span>
      </div>
      <div className="hidden max-w-sm lg:block">
        <p className="text-[2rem] leading-[1.15] font-bold tracking-[-0.015em]">
          {t('app.tagline')}
        </p>
        <ul className="mt-8 space-y-3">
          {PRINCIPLES.map((key) => (
            <li key={key} className="flex gap-3 text-muted">
              <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="hidden text-sm text-muted lg:block">
        {SOURCE_URL ? <SourceLink className="underline-offset-4 hover:underline" /> : 'AGPL-3.0'}
      </p>
    </aside>
  );
}
