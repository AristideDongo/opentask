export const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex h-8 items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 text-[0.9375rem]',
    isActive
      ? 'bg-accent-soft font-semibold text-ink'
      : 'text-muted hover:bg-sunken hover:text-ink',
  ].join(' ');
