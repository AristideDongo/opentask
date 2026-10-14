import type { ColumnVM } from '../../shared/types/project.types';
import type { TaskVM } from '../../shared/types/task.types';

export type ProjectView = 'list' | 'board';

export type SetTasks = (update: (tasks: TaskVM[]) => TaskVM[]) => void;

export interface TaskPlacement {
  columnId: string;
  beforeTaskId?: string | null;
}

export interface ColumnGroupVM {
  column: ColumnVM | null;
  items: TaskVM[];
}
