import type { TaskStatus } from '@opentask/contracts/tasks/status';

export interface ColumnFact {
  id: string;
  name: string;
  category: TaskStatus;
  position: number;
}

export interface ColumnTarget {
  columnId?: string;
  status?: TaskStatus;
}
