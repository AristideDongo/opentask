import type { ColumnVM } from '../../../shared/types/project.types';
import type { TaskVM } from '../../../shared/types/task.types';
import type { ColumnGroupVM } from '../project.types';

export function toColumnGroups(
  tasks: TaskVM[],
  columns: ColumnVM[],
  grouped: boolean,
): ColumnGroupVM[] {
  if (!grouped) return [{ column: null, items: tasks }];
  return columns
    .map((column) => ({ column, items: tasks.filter((task) => task.column.id === column.id) }))
    .filter((group) => group.items.length > 0);
}

export function placeTask(tasks: TaskVM[], taskId: string, beforeId: string | null) {
  const moved = tasks.find((task) => task.id === taskId);
  if (!moved) return tasks;
  const without = tasks.filter((task) => task.id !== taskId);
  const index = beforeId ? without.findIndex((task) => task.id === beforeId) : -1;
  if (index < 0) return [...without, moved];
  return [...without.slice(0, index), moved, ...without.slice(index)];
}

export const withColumn = (task: TaskVM, column: ColumnVM): TaskVM => ({
  ...task,
  column: { id: column.id, name: column.name },
  status: column.category,
  isDone: column.category === 'done',
});
