import type { TaskComment } from '@opentask/contracts/tasks/comment';
import type { MyTask, Task, TaskDetail } from '@opentask/contracts/tasks/task';
import { decideTaskDeletion } from '@opentask/contracts/workspaces/permissions';
import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import type { CommentVM, MyTaskVM, TaskDetailVM, TaskVM } from '../types/task.types';
import { todayIso } from '../utils/date';
import { toPersonVM } from './person.mapper';
import { toLabelVM } from './project.mapper';

export const toTaskVM = (t: Task): TaskVM => ({
  id: t.id,
  projectId: t.projectId,
  parentId: t.parentId,
  title: t.title,
  description: t.description,
  status: t.status,
  isDone: t.status === 'done',
  column: t.column,
  priority: t.priority,
  dueDate: t.dueDate,
  isOverdue: t.dueDate !== null && t.status !== 'done' && t.dueDate < todayIso(),
  assignee: t.assignee ? toPersonVM(t.assignee) : null,
  createdBy: t.createdBy ? toPersonVM(t.createdBy) : null,
  labels: t.labels.map(toLabelVM),
  subtasks: t.subtaskCount > 0 ? { done: t.subtaskDoneCount, total: t.subtaskCount } : null,
  commentCount: t.commentCount,
  completedAt: t.completedAt,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

export const toMyTaskVM = (t: MyTask): MyTaskVM => ({ ...toTaskVM(t), projectName: t.projectName });

export const toCommentVM = (c: TaskComment): CommentVM => ({
  id: c.id,
  author: c.author ? toPersonVM(c.author) : null,
  body: c.body,
  createdAt: c.createdAt,
});

export const toTaskDetailVM = (
  t: TaskDetail,
  actor: { userId: string; role: WorkspaceRole },
): TaskDetailVM => ({
  ...toTaskVM(t),
  projectName: t.projectName,
  subtaskList: t.subtasks.map(toTaskVM),
  comments: t.comments.map(toCommentVM),
  canDelete: decideTaskDeletion(actor, { createdById: t.createdBy?.id ?? null }).allowed,
});
