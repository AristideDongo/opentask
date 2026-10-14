import { Link } from 'react-router';
import { DueDate } from '../../../shared/components/due-date';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { MyTaskVM } from '../../../shared/types/task.types';

export function MyTasksSection({ workspaceId, tasks }: { workspaceId: string; tasks: MyTaskVM[] }) {
  const { t } = useI18n();
  const base = `/w/${workspaceId}`;
  return (
    <Section title={`${t('home.myOpenTasks')} (${tasks.length})`}>
      {tasks.length === 0 ? (
        <p className="text-muted">{t('myTasks.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-center gap-3">
              <Link
                to={`${base}/p/${task.projectId}/t/${task.id}`}
                className="min-w-0 flex-1 truncate hover:underline"
              >
                {task.title}
              </Link>
              <DueDate dueDate={task.dueDate} isOverdue={task.isOverdue} />
            </li>
          ))}
        </ul>
      )}
      <Link
        to={`${base}/my-tasks`}
        className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
      >
        {t('home.seeMyTasks')}
      </Link>
    </Section>
  );
}
