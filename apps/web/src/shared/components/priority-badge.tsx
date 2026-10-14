import type { TaskPriority } from '@opentask/contracts/tasks/status';
import { clsx } from 'clsx';
import { useI18n } from '../hooks/useI18n';

const styles: Record<TaskPriority, string> = {
  low: 'text-muted',
  normal: 'text-muted',
  high: 'bg-[#fdf0d5] text-[#7a4b00] dark:bg-[#3a2c0d] dark:text-[#f0c36d]',
  urgent: 'bg-danger-soft text-danger',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { t } = useI18n();
  if (priority === 'normal') return null;
  return (
    <span
      className={clsx(
        'inline-flex h-5 items-center rounded px-1.5 text-xs font-semibold',
        styles[priority],
      )}
    >
      {t(`priority.${priority}`)}
    </span>
  );
}
