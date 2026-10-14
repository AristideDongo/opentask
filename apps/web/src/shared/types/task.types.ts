import type { TaskPriority, TaskStatus } from '@opentask/contracts/tasks/status';
import type { PersonVM } from './person.types';
import type { LabelVM, ProgressVM } from './project.types';

export interface TaskVM {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  isDone: boolean;
  column: { id: string; name: string };
  priority: TaskPriority;
  dueDate: string | null;
  isOverdue: boolean;
  assignee: PersonVM | null;
  createdBy: PersonVM | null;
  labels: LabelVM[];
  subtasks: ProgressVM | null;
  commentCount: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyTaskVM extends TaskVM {
  projectName: string;
}

export interface CommentVM {
  id: string;
  author: PersonVM | null;
  body: string;
  createdAt: string;
}

export interface TaskDetailVM extends TaskVM {
  projectName: string;
  subtaskList: TaskVM[];
  comments: CommentVM[];
  canDelete: boolean;
}
