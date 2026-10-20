import { type TaskComment, TaskCommentSchema } from '@opentask/contracts/tasks/comment';
import {
  type MyTask,
  MyTaskSchema,
  type Task,
  type TaskDetail,
  TaskDetailSchema,
  TaskSchema,
} from '@opentask/contracts/tasks/task';
import { toAttachmentDto } from '../../attachments/mappers/attachment.mapper';
import type { AttachmentRow } from '../../attachments/repository/attachment.repository';
import type { TaskRow } from '../repository/task.repository';

interface CommentRow {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string } | null;
  mentions: { user: { id: string; name: string } }[];
}

const toDay = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

const taskFields = (t: TaskRow) => ({
  id: t.id,
  projectId: t.projectId,
  parentId: t.parentId,
  title: t.title,
  description: t.description,
  status: t.status,
  column: t.column,
  priority: t.priority,
  dueDate: toDay(t.dueDate),
  assignee: t.assignee?.user ?? null,
  createdBy: t.createdBy,
  labels: t.labels.map((l) => l.label),
  position: t.position,
  subtaskCount: t.subtasks.length,
  subtaskDoneCount: t.subtasks.filter((s) => s.status === 'done').length,
  commentCount: t._count.comments,
  completedAt: t.completedAt?.toISOString() ?? null,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

const commentFields = (c: CommentRow) => ({
  id: c.id,
  author: c.author,
  body: c.body,
  mentions: c.mentions.map((m) => m.user),
  createdAt: c.createdAt.toISOString(),
});

export const toTaskDto = (t: TaskRow): Task => TaskSchema.parse(taskFields(t));

export const toMyTaskDto = (t: TaskRow & { project: { name: string } }): MyTask =>
  MyTaskSchema.parse({ ...taskFields(t), projectName: t.project.name });

export const toCommentDto = (c: CommentRow): TaskComment =>
  TaskCommentSchema.parse(commentFields(c));

export const toTaskDetailDto = (
  t: TaskRow,
  projectName: string,
  subtasks: TaskRow[],
  comments: CommentRow[],
  attachments: AttachmentRow[],
): TaskDetail =>
  TaskDetailSchema.parse({
    ...taskFields(t),
    projectName,
    subtasks: subtasks.map(taskFields),
    comments: comments.map(commentFields),
    attachments: attachments.map(toAttachmentDto),
  });
