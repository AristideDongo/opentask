import { clsx } from 'clsx';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function Alert({
  tone,
  children,
}: {
  tone: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx(
        'flex gap-2.5 rounded-[var(--radius-control)] px-3 py-2.5 text-sm',
        tone === 'error' && 'bg-danger-soft text-danger',
        tone === 'success' && 'bg-accent-soft text-ink',
        tone === 'info' && 'bg-sunken text-ink',
      )}
    >
      {tone !== 'info' && <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}
