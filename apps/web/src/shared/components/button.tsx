import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-sunken',
  ghost: 'text-muted hover:bg-sunken hover:text-ink',
  danger: 'bg-danger text-white hover:opacity-90 dark:text-sunken',
};

export function Button({
  variant = 'primary',
  size = 'md',
  busy = false,
  className,
  children,
  disabled,
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant; size?: 'sm' | 'md'; busy?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        size === 'md' ? 'h-10 px-4 text-[0.9375rem]' : 'h-8 px-3 text-sm',
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
