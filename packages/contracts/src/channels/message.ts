import { z } from 'zod';
import { paginated } from '../common/pagination';
import { AttachmentIdsSchema, AttachmentSchema } from '../attachments/attachment';
import { IdSchema, IsoDateTimeSchema, RefSchema } from '../common/primitives';

export const MessageSchema = z.object({
  id: IdSchema,
  channelId: IdSchema,
  author: RefSchema.nullable(),
  body: z.string().describe('Vide si le message a été supprimé'),
  attachments: z.array(AttachmentSchema),
  mentions: z.array(RefSchema).describe('Personnes mentionnées par <@identifiant> dans le texte'),
  editedAt: IsoDateTimeSchema.nullable(),
  deletedAt: IsoDateTimeSchema.nullable(),
  createdAt: IsoDateTimeSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const MessagePageSchema = paginated(MessageSchema);
export type MessagePage = z.infer<typeof MessagePageSchema>;

const MessageBodySchema = z.string().trim().max(4000, { error: '4000 caractères maximum.' });

export const MessageInputSchema = z
  .object({
    body: MessageBodySchema.default(''),
    attachmentIds: AttachmentIdsSchema.default([]),
  })
  .refine((m) => m.body.length > 0 || m.attachmentIds.length > 0, {
    error: 'Message vide.',
    path: ['body'],
  });
export type MessageInput = z.input<typeof MessageInputSchema>;
export type MessageData = z.output<typeof MessageInputSchema>;

export const MessageEditInputSchema = z.object({
  body: MessageBodySchema.min(1, { error: 'Message vide.' }),
});
export type MessageEditInput = z.infer<typeof MessageEditInputSchema>;
