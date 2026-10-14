import type { TaskStatus } from '@opentask/contracts/tasks/status';

export interface LabelVM {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

export interface ColumnVM {
  id: string;
  name: string;
  category: TaskStatus;
}

export interface ProgressVM {
  done: number;
  total: number;
}

export interface ProjectVM {
  id: string;
  name: string;
  description: string;
  team: { id: string; name: string } | null;
  labels: LabelVM[];
  columns: ColumnVM[];
  progress: ProgressVM;
}
