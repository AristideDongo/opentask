import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema, RefSchema, nonEmptyPatch } from '../common/primitives';
import { DescriptionSchema, EntityNameSchema } from '../common/text';
import { TaskStatusSchema } from '../tasks/status';
import { ColumnSchema } from './column';
import { LabelSchema } from './label';

export const ProjectSchema = z.object({
  id: IdSchema,
  name: z.string(),
  description: z.string(),
  team: RefSchema.nullable(),
  labels: z.array(LabelSchema),
  columns: z.array(ColumnSchema),
  taskCounts: z.record(TaskStatusSchema, z.number().int()),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectListSchema = z.object({ items: z.array(ProjectSchema) });
export type ProjectList = z.infer<typeof ProjectListSchema>;

export const CreateProjectInputSchema = z.object({
  name: EntityNameSchema,
  description: DescriptionSchema.default(''),
  teamId: IdSchema.nullable().default(null),
});
export type CreateProjectInput = z.input<typeof CreateProjectInputSchema>;

export const UpdateProjectInputSchema = nonEmptyPatch({
  name: EntityNameSchema,
  description: DescriptionSchema,
  teamId: IdSchema.nullable(),
});
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
