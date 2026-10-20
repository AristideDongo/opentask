import { AttachmentSchema } from '../attachments/attachment';
import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema, RefSchema, nonEmptyPatch } from '../common/primitives';
import { LabelSchema } from '../projects/label';
import { TaskCommentSchema } from './comment';
import { TaskPrioritySchema, TaskStatusSchema } from './status';

export const MAX_LABELS_PER_TASK = 10;

const DueDateSchema = z.iso.date({ error: 'Date invalide (AAAA-MM-JJ).' });
const TitleSchema = z
  .string()
  .trim()
  .min(1, { error: 'Titre requis.' })
  .max(200, { error: '200 caractères maximum.' });
const LabelIdsSchema = z
  .array(IdSchema)
  .max(MAX_LABELS_PER_TASK, { error: `${MAX_LABELS_PER_TASK} tags maximum par tâche.` });

export const TaskSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  parentId: IdSchema.nullable(),
  title: z.string(),
  description: z.string(),
  status: TaskStatusSchema.describe('Type de la colonne courante'),
  column: RefSchema,
  priority: TaskPrioritySchema,
  dueDate: z.string().nullable().describe('AAAA-MM-JJ'),
  assignee: RefSchema.nullable(),
  createdBy: RefSchema.nullable(),
  labels: z.array(LabelSchema),
  position: z.number(),
  subtaskCount: z.number().int(),
  subtaskDoneCount: z.number().int(),
  commentCount: z.number().int(),
  completedAt: IsoDateTimeSchema.nullable(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskListSchema = z.object({ items: z.array(TaskSchema) });
export type TaskList = z.infer<typeof TaskListSchema>;

export const MyTaskSchema = TaskSchema.extend({ projectName: z.string() });
export type MyTask = z.infer<typeof MyTaskSchema>;
export const MyTaskListSchema = z.object({ items: z.array(MyTaskSchema) });
export type MyTaskList = z.infer<typeof MyTaskListSchema>;

export const TaskDetailSchema = TaskSchema.extend({
  projectName: z.string(),
  subtasks: z.array(TaskSchema),
  comments: z.array(TaskCommentSchema),
  attachments: z.array(AttachmentSchema),
});
export type TaskDetail = z.infer<typeof TaskDetailSchema>;

export const TASK_SORTS = ['position', 'dueDate', 'priority', 'createdAt', 'title'] as const;
export type TaskSort = (typeof TASK_SORTS)[number];

export const TaskQuerySchema = z.object({
  status: TaskStatusSchema.optional(),
  columnId: IdSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  assigneeId: z.union([IdSchema, z.literal('none')]).optional(),
  labelId: IdSchema.optional(),
  q: z.string().trim().max(200).optional(),
  sort: z.enum(TASK_SORTS).default('position'),
  includeSubtasks: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default(false),
});
export type TaskQuery = z.infer<typeof TaskQuerySchema>;

export const CreateTaskInputSchema = z.object({
  title: TitleSchema,
  description: z.string().max(10_000).default(''),
  columnId: IdSchema.optional().describe(
    'À défaut : première colonne du type `status`, sinon première colonne',
  ),
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.default('normal'),
  dueDate: DueDateSchema.nullable().default(null),
  assigneeId: IdSchema.nullable().default(null),
  parentId: IdSchema.nullable().default(null),
  labelIds: LabelIdsSchema.default([]),
});
export type CreateTaskInput = z.input<typeof CreateTaskInputSchema>;
export type CreateTaskData = z.output<typeof CreateTaskInputSchema>;

export const UpdateTaskInputSchema = nonEmptyPatch({
  title: TitleSchema,
  description: z.string().max(10_000),
  columnId: IdSchema,
  status: TaskStatusSchema.describe('Déplace vers la première colonne de ce type'),
  priority: TaskPrioritySchema,
  dueDate: DueDateSchema.nullable(),
  assigneeId: IdSchema.nullable(),
  labelIds: LabelIdsSchema,
  beforeTaskId: IdSchema.nullable().describe(
    'Place la tâche avant celle-ci dans sa colonne ; à la fin si null',
  ),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
