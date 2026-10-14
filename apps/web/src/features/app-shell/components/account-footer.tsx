import { clsx } from 'clsx';
import { LogOut, UserRound } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { Avatar } from '../../../shared/components/avatar';
import { SourceLink } from '../../../shared/components/source-link';
import { useI18n } from '../../../shared/hooks/useI18n';
import { signOut } from '../../../shared/servers/session.service';
import type { MeVM } from '../../../shared/types/person.types';
import { ThemeSelect } from './theme-select';

export function AccountFooter({ me }: { me: MeVM }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <div className="space-y-1 border-t border-line p-3">
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-2.5 rounded-[var(--radius-control)] p-2',
            isActive ? 'bg-accent-soft' : 'hover:bg-sunken',
          )
        }
      >
        <Avatar initials={me.initials} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{me.name}</span>
          <span className="block truncate text-xs text-muted">{me.email}</span>
        </span>
        <UserRound aria-hidden className="ml-auto size-4 text-muted" />
        <span className="sr-only">{t('nav.profile')}</span>
      </NavLink>
      <div className="flex items-center gap-1">
        <ThemeSelect />
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate('/login', { replace: true });
          }}
          className="flex h-8 items-center gap-1.5 rounded-[var(--radius-control)] px-2 text-sm text-muted hover:bg-sunken hover:text-ink"
        >
          <LogOut aria-hidden className="size-4" />
          {t('auth.logout')}
        </button>
      </div>
      <SourceLink className="block px-2 pt-1 text-xs text-muted underline-offset-4 hover:underline" />
    </div>
  );
}
