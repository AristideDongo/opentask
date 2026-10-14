import { clsx } from 'clsx';
import { type ReactNode, useId } from 'react';

export function Section({
  title,
  description,
  tone = 'default',
  children,
}: {
  title: string;
  description?: ReactNode;
  tone?: 'default' | 'danger';
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={clsx(
        'rounded-[var(--radius-panel)] border bg-surface p-5 sm:p-6',
        tone === 'danger' ? 'border-danger/40' : 'border-line',
      )}
    >
      <h2 id={headingId} className={clsx('text-lg font-bold', tone === 'danger' && 'text-danger')}>
        {title}
      </h2>
      {description && <p className="mt-1 max-w-[65ch] text-sm text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
