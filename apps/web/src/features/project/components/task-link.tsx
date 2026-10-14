import { Link, useLocation } from 'react-router';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { TaskVM } from '../../../shared/types/task.types';

export function TaskLink({ task }: { task: Pick<TaskVM, 'id' | 'title'> }) {
  const location = useLocation();
  const { t } = useI18n();
  return (
    <Link
      to={{ pathname: `t/${task.id}`, search: location.search }}
      aria-label={t('task.open', { title: task.title })}
      className="font-medium hover:underline focus-visible:underline"
    >
      {task.title}
    </Link>
  );
}
