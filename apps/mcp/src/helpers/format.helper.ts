import type { TaskComment } from '@opentask/contracts/tasks/comment';
import type { Task, TaskDetail } from '@opentask/contracts/tasks/task';
import { MAX_COMMENT_CHARS, MAX_DESCRIPTION_CHARS } from './limits.const';

export interface Page<T> {
  items: T[];
  total: number;
  offset: number;
  nextOffset: number | null;
}

export function paginate<T>(items: T[], offset: number, limit: number): Page<T> {
  const slice = items.slice(offset, offset + limit);
  const next = offset + slice.length;
  return {
    items: slice,
    total: items.length,
    offset,
    nextOffset: next < items.length ? next : null,
  };
}

export const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

export const pageNote = (page: Page<unknown>, noun: string) =>
  page.nextOffset === null
    ? `${page.total} ${noun} au total.`
    : `${page.items.length} ${noun} affichés sur ${page.total} : relancez avec offset=${page.nextOffset} pour la suite.`;

export const toTaskSummary = (task: Task) => ({
  id: task.id,
  projectId: task.projectId,
  parentId: task.parentId,
  title: task.title,
  status: task.status,
  column: task.column,
  priority: task.priority,
  dueDate: task.dueDate,
  assignee: task.assignee,
  labels: task.labels.map((label) => label.name),
  subtasks: { done: task.subtaskDoneCount, total: task.subtaskCount },
  commentCount: task.commentCount,
});

export const toCommentView = (comment: TaskComment) => ({
  id: comment.id,
  author: comment.author?.name ?? null,
  body: clip(comment.body, MAX_COMMENT_CHARS),
  createdAt: comment.createdAt,
});

export const toTaskDetailView = (task: TaskDetail) => ({
  ...toTaskSummary(task),
  projectName: task.projectName,
  description: clip(task.description, MAX_DESCRIPTION_CHARS),
  createdBy: task.createdBy,
  completedAt: task.completedAt,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  subtaskList: task.subtasks.map(toTaskSummary),
});

export const isOverdue = (task: Pick<Task, 'dueDate' | 'status'>, today: string) =>
  task.dueDate !== null && task.status !== 'done' && task.dueDate < today;

export const todayIso = (now = new Date()) => now.toISOString().slice(0, 10);

export const taskLine = (task: Pick<Task, 'id' | 'title' | 'status' | 'dueDate'>) =>
  `- [${task.status}] ${task.title} (id ${task.id}${task.dueDate ? `, échéance ${task.dueDate}` : ''})`;
