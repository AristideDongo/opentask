import { Menu, X } from 'lucide-react';
import { Logo } from '../../../shared/components/logo';
import { useI18n } from '../../../shared/hooks/useI18n';

export function MobileTopBar({ open, onToggle }: { open: boolean; onToggle(): void }) {
  const { t } = useI18n();
  return (
    <div className="flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
      <div className="flex items-center gap-2">
        <Logo className="size-6" />
        <span className="font-bold">{t('app.name')}</span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="sidebar"
        className="rounded-[var(--radius-control)] p-2 hover:bg-sunken"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        <span className="sr-only">{t('nav.openMenu')}</span>
      </button>
    </div>
  );
}
