import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema, RefSchema } from '../common/primitives';

export const TaskCommentSchema = z.object({
  id: IdSchema,
  author: RefSchema.nullable(),
  body: z.string(),
  mentions: z.array(RefSchema),
  createdAt: IsoDateTimeSchema,
});
export type TaskComment = z.infer<typeof TaskCommentSchema>;

export const CreateCommentInputSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { error: 'Message vide.' })
    .max(4000, { error: '4000 caractères maximum.' }),
});
export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;
