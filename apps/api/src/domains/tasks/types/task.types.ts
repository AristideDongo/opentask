import type { TaskStatus } from '@opentask/contracts/tasks/status';
import type { ColumnFact } from '../../projects/types/column.types';

export interface TaskReferences {
  parentId?: string | null;
  assigneeId?: string | null;
  labelIds?: string[];
}

export interface FindTaskFactsOptions extends TaskReferences {
  workspaceId: string;
  projectId: string;
}

export interface TaskValidationFacts {
  columns: ColumnFact[];
  parent: { projectId: string; parentId: string | null } | null;
  assigneeIsMember: boolean;
  existingLabelIds: string[];
}

export interface TaskMove {
  columnId: string;
  status: TaskStatus;
}
