import { clsx } from 'clsx';
import type { FeatureStatus } from '../landing.types';

const STYLES: Record<FeatureStatus, string> = {
  available: 'bg-accent text-accent-ink',
  'in-progress': 'bg-accent-soft text-accent',
  planned: 'border border-line text-muted',
};

export function StatusBadge({ status, label }: { status: FeatureStatus; label: string }) {
  return (
    <span
      data-status={status}
      className={clsx(
        'inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold',
        STYLES[status],
      )}
    >
      {label}
    </span>
  );
}
