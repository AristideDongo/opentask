import { clsx } from 'clsx';
import { CalendarDays } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

export function DueDate({ dueDate, isOverdue }: { dueDate: string | null; isOverdue: boolean }) {
  const { t, formatDate } = useI18n();
  if (!dueDate) return null;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs',
        isOverdue ? 'font-semibold text-danger' : 'text-muted',
      )}
    >
      <CalendarDays aria-hidden className="size-3.5" />
      <time dateTime={dueDate}>
        {formatDate(`${dueDate}T12:00:00`, { day: 'numeric', month: 'short' })}
      </time>
      {isOverdue && <span className="sr-only">({t('task.overdue')})</span>}
    </span>
  );
}
