import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

type LinkButtonVariant = 'primary' | 'secondary' | 'ghost';

const styles: Record<LinkButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-sunken',
  ghost: 'text-ink hover:bg-sunken',
};

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  external = false,
  className,
  children,
}: {
  to: string;
  variant?: LinkButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const classes = clsx(
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold whitespace-nowrap transition-colors',
    size === 'sm' && 'h-8 px-3 text-sm',
    size === 'md' && 'h-10 px-4 text-[0.9375rem]',
    size === 'lg' && 'h-12 px-6 text-base',
    styles[variant],
    className,
  );
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}
