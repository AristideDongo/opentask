import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema, RefSchema, nonEmptyPatch } from '../common/primitives';
import { DescriptionSchema, EntityNameSchema } from '../common/text';

export const TeamSchema = z.object({
  id: IdSchema,
  name: z.string(),
  description: z.string(),
  members: z.array(RefSchema),
  projectCount: z.number().int(),
  createdAt: IsoDateTimeSchema,
});
export type Team = z.infer<typeof TeamSchema>;

export const TeamListSchema = z.object({ items: z.array(TeamSchema) });
export type TeamList = z.infer<typeof TeamListSchema>;

export const CreateTeamInputSchema = z.object({
  name: EntityNameSchema,
  description: DescriptionSchema.default(''),
  memberIds: z.array(IdSchema).max(500).default([]),
});
export type CreateTeamInput = z.input<typeof CreateTeamInputSchema>;

export const UpdateTeamInputSchema = nonEmptyPatch({
  name: EntityNameSchema,
  description: DescriptionSchema,
});
export type UpdateTeamInput = z.infer<typeof UpdateTeamInputSchema>;
