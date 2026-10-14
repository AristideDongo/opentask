import { clsx } from 'clsx';
import { Assignee } from '../../../shared/components/assignee';
import { DueDate } from '../../../shared/components/due-date';
import { LabelList } from '../../../shared/components/label-chip';
import { PriorityBadge } from '../../../shared/components/priority-badge';
import { TaskStatusIcon } from '../../../shared/components/task-status-icon';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ProjectVM } from '../../../shared/types/project.types';
import type { TaskVM } from '../../../shared/types/task.types';
import { useProjectFilters } from '../hooks/useProjectFilters';
import { useTaskMove } from '../hooks/useTaskMove';
import { toColumnGroups } from '../mappers/column-group.mapper';
import type { SetTasks } from '../project.types';
import { ColumnSelect } from './column-select';
import { TaskLink } from './task-link';
import { TaskMeta } from './task-meta';

export function ListView({
  project,
  tasks,
  setTasks,
  canWrite,
}: {
  project: ProjectVM;
  tasks: TaskVM[];
  setTasks: SetTasks;
  canWrite: boolean;
}) {
  const { t } = useI18n();
  const move = useTaskMove(setTasks, project.columns);
  const { grouped } = useProjectFilters();

  if (tasks.length === 0) {
    return (
      <p className="py-10 text-center text-muted">
        {project.progress.total === 0 ? t('project.empty') : t('project.noMatch')}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {toColumnGroups(tasks, project.columns, grouped).map((group) => (
        <section key={group.column?.id ?? 'all'} aria-label={group.column?.name}>
          {group.column && (
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <TaskStatusIcon status={group.column.category} />
              {group.column.name}
              <span className="font-normal text-muted">{group.items.length}</span>
            </h2>
          )}
          <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-line bg-surface">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-line text-xs text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    {t('task.title')}
                  </th>
                  <th scope="col" className="w-40 px-3 py-2 font-semibold">
                    {t('task.assignee')}
                  </th>
                  <th scope="col" className="w-28 px-3 py-2 font-semibold">
                    {t('task.dueDate')}
                  </th>
                  <th scope="col" className="w-24 px-3 py-2 font-semibold">
                    {t('task.priority')}
                  </th>
                  <th scope="col" className="w-36 px-3 py-2 font-semibold">
                    {t('task.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {group.items.map((task) => (
                  <tr key={task.id} className="hover:bg-sunken/60">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <TaskStatusIcon status={task.status} />
                        <span className={clsx(task.isDone && 'text-muted line-through')}>
                          <TaskLink task={task} />
                        </span>
                        <LabelList labels={task.labels} />
                        <TaskMeta task={task} />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Assignee person={task.assignee} showName />
                    </td>
                    <td className="px-3 py-2">
                      <DueDate dueDate={task.dueDate} isOverdue={task.isOverdue} />
                    </td>
                    <td className="px-3 py-2">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-1 py-1">
                      <ColumnSelect
                        task={task}
                        columns={project.columns}
                        disabled={!canWrite}
                        onChange={(columnId) => void move(task.id, { columnId })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
