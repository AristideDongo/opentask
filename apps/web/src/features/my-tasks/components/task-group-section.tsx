import { Link } from 'react-router';
import { DueDate } from '../../../shared/components/due-date';
import { LabelList } from '../../../shared/components/label-chip';
import { PriorityBadge } from '../../../shared/components/priority-badge';
import { Section } from '../../../shared/components/section';
import { TaskStatusIcon } from '../../../shared/components/task-status-icon';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { TaskGroupVM } from '../my-tasks.types';

export function TaskGroupSection({
  workspaceId,
  group,
}: {
  workspaceId: string;
  group: TaskGroupVM;
}) {
  const { t } = useI18n();
  return (
    <Section title={`${t(group.key)} (${group.items.length})`}>
      <ul className="divide-y divide-line">
        {group.items.map((task) => (
          <li key={task.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
            <Link
              to={`/w/${workspaceId}/p/${task.projectId}/t/${task.id}`}
              className="min-w-0 flex-1 font-medium hover:underline"
            >
              {task.title}
            </Link>
            <LabelList labels={task.labels} />
            <span className="text-sm text-muted">{task.projectName}</span>
            <PriorityBadge priority={task.priority} />
            <DueDate dueDate={task.dueDate} isOverdue={task.isOverdue} />
            <span className="inline-flex items-center gap-1.5 text-sm">
              <TaskStatusIcon status={task.status} />
              {task.column.name}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
