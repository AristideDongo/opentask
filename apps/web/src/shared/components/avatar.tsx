import { clsx } from 'clsx';

export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-ink',
        size === 'md' ? 'size-9 text-sm' : 'size-7 text-xs',
      )}
    >
      {initials}
    </span>
  );
}
