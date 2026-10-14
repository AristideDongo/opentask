import { clsx } from 'clsx';
import type { DragEvent } from 'react';
import { Assignee } from '../../../shared/components/assignee';
import { DueDate } from '../../../shared/components/due-date';
import { LabelList } from '../../../shared/components/label-chip';
import { PriorityBadge } from '../../../shared/components/priority-badge';
import type { ColumnVM } from '../../../shared/types/project.types';
import type { TaskVM } from '../../../shared/types/task.types';
import { ColumnSelect } from './column-select';
import { TaskLink } from './task-link';
import { TaskMeta } from './task-meta';

export function KanbanCard({
  task,
  columns,
  canWrite,
  dragging,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onColumnChange,
}: {
  task: TaskVM;
  columns: ColumnVM[];
  canWrite: boolean;
  dragging: boolean;
  dropTarget: boolean;
  onDragStart(e: DragEvent): void;
  onDragEnd(): void;
  onDragOver(e: DragEvent): void;
  onDrop(e: DragEvent): void;
  onColumnChange(columnId: string): void;
}) {
  return (
    <li
      draggable={canWrite}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={clsx(
        'rounded-[var(--radius-control)] border bg-surface p-3 shadow-sm',
        canWrite && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-50',
        dropTarget ? 'border-t-4 border-accent' : 'border-line',
      )}
    >
      {task.labels.length > 0 && (
        <div className="mb-2">
          <LabelList labels={task.labels} />
        </div>
      )}
      <p
        className={clsx('text-[0.9375rem] leading-snug', task.isDone && 'text-muted line-through')}
      >
        <TaskLink task={task} />
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <DueDate dueDate={task.dueDate} isOverdue={task.isOverdue} />
        <TaskMeta task={task} />
        <span className="ml-auto">
          <Assignee person={task.assignee} />
        </span>
      </div>
      {canWrite && (
        <div className="mt-2 border-t border-line pt-1.5">
          <ColumnSelect task={task} columns={columns} disabled={false} onChange={onColumnChange} />
        </div>
      )}
    </li>
  );
}
