import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema, RefSchema } from '../common/primitives';

export const MAX_ATTACHMENTS_PER_MESSAGE = 10;

export const INLINE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as const;

export const AttachmentSchema = z.object({
  id: IdSchema,
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  isImage: z.boolean(),
  url: z.string().describe('Chemin de téléchargement, authentifié comme le reste de l’API'),
  uploadedBy: RefSchema.nullable(),
  createdAt: IsoDateTimeSchema,
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const AttachmentListSchema = z.object({ items: z.array(AttachmentSchema) });
export type AttachmentList = z.infer<typeof AttachmentListSchema>;

export const AttachmentIdsSchema = z
  .array(IdSchema)
  .max(MAX_ATTACHMENTS_PER_MESSAGE, { error: `${MAX_ATTACHMENTS_PER_MESSAGE} fichiers maximum.` })
  .transform((ids) => [...new Set(ids)]);

export const attachmentContentPath = (workspaceId: string, attachmentId: string) =>
  `/api/v1/workspaces/${workspaceId}/attachments/${attachmentId}/content`;
