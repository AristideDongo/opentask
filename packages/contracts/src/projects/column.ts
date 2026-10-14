import { z } from 'zod';
import { IdSchema, nonEmptyPatch } from '../common/primitives';
import { ShortNameSchema } from '../common/text';
import { TaskStatusSchema } from '../tasks/status';

export const ColumnSchema = z.object({
  id: IdSchema,
  name: z.string(),
  category: TaskStatusSchema.describe(
    'Type de base : décide si les tâches de la colonne sont terminées',
  ),
  position: z.number(),
});
export type Column = z.infer<typeof ColumnSchema>;

export const ColumnListSchema = z.object({ items: z.array(ColumnSchema) });
export type ColumnList = z.infer<typeof ColumnListSchema>;

export const CreateColumnInputSchema = z.object({
  name: ShortNameSchema,
  category: TaskStatusSchema.default('in_progress'),
  beforeColumnId: IdSchema.nullable()
    .default(null)
    .describe('Insère avant cette colonne ; à la fin si null'),
});
export type CreateColumnInput = z.input<typeof CreateColumnInputSchema>;

export const UpdateColumnInputSchema = nonEmptyPatch({
  name: ShortNameSchema,
  category: TaskStatusSchema,
  beforeColumnId: IdSchema.nullable(),
});
export type UpdateColumnInput = z.infer<typeof UpdateColumnInputSchema>;

export const DeleteColumnInputSchema = z.object({ moveTasksTo: IdSchema.nullable().default(null) });
export type DeleteColumnInput = z.input<typeof DeleteColumnInputSchema>;
