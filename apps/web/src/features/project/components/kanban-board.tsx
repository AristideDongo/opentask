import { clsx } from 'clsx';
import { Plus } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ProjectVM } from '../../../shared/types/project.types';
import type { TaskVM } from '../../../shared/types/task.types';
import { useTaskMove } from '../hooks/useTaskMove';
import type { SetTasks } from '../project.types';
import { AddColumn } from './add-column';
import { ColumnHeader } from './column-header';
import { CreateTaskDialog } from './create-task-dialog';
import { KanbanCard } from './kanban-card';

const columnTarget = (columnId: string) => `col:${columnId}`;

export function KanbanBoard({
  project,
  tasks,
  setTasks,
  canWrite,
  canManageColumns,
}: {
  project: ProjectVM;
  tasks: TaskVM[];
  setTasks: SetTasks;
  canWrite: boolean;
  canManageColumns: boolean;
}) {
  const { t } = useI18n();
  const { columns } = project;
  const move = useTaskMove(setTasks, columns);
  const [dragged, setDragged] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const allowDrop = (e: DragEvent, target: string) => {
    if (!canWrite) return;
    e.preventDefault();
    e.stopPropagation();
    setOver(target);
  };
  const drop = (e: DragEvent, columnId: string, beforeTaskId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData('text/plain');
    setDragged(null);
    setOver(null);
    if (id) void move(id, { columnId, beforeTaskId });
  };

  return (
    <div className="flex items-start gap-3 overflow-x-auto pb-4">
      {columns.map((column, index) => {
        const items = tasks.filter((task) => task.column.id === column.id);
        return (
          <section
            key={column.id}
            aria-label={column.name}
            onDragOver={(e) => allowDrop(e, columnTarget(column.id))}
            onDragLeave={() => setOver((o) => (o === columnTarget(column.id) ? null : o))}
            onDrop={(e) => drop(e, column.id, null)}
            className={clsx(
              'flex min-h-48 w-[17rem] shrink-0 flex-col rounded-[var(--radius-panel)] bg-sunken p-2',
              over === columnTarget(column.id) && 'ring-2 ring-accent',
            )}
          >
            <ColumnHeader
              projectId={project.id}
              column={column}
              columns={columns}
              index={index}
              count={items.length}
              editable={canManageColumns}
            />
            <ul className="flex flex-1 flex-col gap-2">
              {items.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  columns={columns}
                  canWrite={canWrite}
                  dragging={dragged === task.id}
                  dropTarget={over === task.id && dragged !== task.id}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDragged(task.id);
                  }}
                  onDragEnd={() => {
                    setDragged(null);
                    setOver(null);
                  }}
                  onDragOver={(e) => allowDrop(e, task.id)}
                  onDrop={(e) => drop(e, column.id, task.id)}
                  onColumnChange={(columnId) =>
                    void move(task.id, { columnId, beforeTaskId: null })
                  }
                />
              ))}
            </ul>
            {canWrite && (
              <CreateTaskDialog
                project={project}
                defaultColumnId={column.id}
                trigger={
                  <button
                    type="button"
                    className="mt-2 flex h-9 w-full items-center gap-2 rounded-[var(--radius-control)] px-2 text-sm text-muted hover:bg-surface hover:text-ink"
                  >
                    <Plus aria-hidden className="size-4" />
                    {t('task.add')}
                    <span className="sr-only">
                      {t('task.addInColumn', { status: column.name })}
                    </span>
                  </button>
                }
              />
            )}
          </section>
        );
      })}
      {canManageColumns && <AddColumn projectId={project.id} />}
    </div>
  );
}
