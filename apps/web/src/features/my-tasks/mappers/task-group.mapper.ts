import type { MyTaskVM } from '../../../shared/types/task.types';
import { todayIso } from '../../../shared/utils/date';
import type { TaskGroupVM } from '../my-tasks.types';

export function toTaskGroups(tasks: MyTaskVM[]): TaskGroupVM[] {
  const today = todayIso();
  const groups: TaskGroupVM[] = [
    { key: 'myTasks.overdue', items: tasks.filter((x) => x.dueDate && x.dueDate < today) },
    { key: 'myTasks.today', items: tasks.filter((x) => x.dueDate === today) },
    { key: 'myTasks.upcoming', items: tasks.filter((x) => x.dueDate && x.dueDate > today) },
    { key: 'myTasks.noDate', items: tasks.filter((x) => !x.dueDate) },
  ];
  return groups.filter((g) => g.items.length > 0);
}
