import { z } from 'zod';
import { paginated } from '../common/pagination';
import { IdSchema, IsoDateTimeSchema, RefSchema } from '../common/primitives';

export const MessageSchema = z.object({
  id: IdSchema,
  channelId: IdSchema,
  author: RefSchema.nullable(),
  body: z.string().describe('Vide si le message a été supprimé'),
  editedAt: IsoDateTimeSchema.nullable(),
  deletedAt: IsoDateTimeSchema.nullable(),
  createdAt: IsoDateTimeSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const MessagePageSchema = paginated(MessageSchema);
export type MessagePage = z.infer<typeof MessagePageSchema>;

export const MessageInputSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { error: 'Message vide.' })
    .max(4000, { error: '4000 caractères maximum.' }),
});
export type MessageInput = z.infer<typeof MessageInputSchema>;
