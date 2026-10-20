import {
  type Attachment,
  AttachmentSchema,
  attachmentContentPath,
} from '@opentask/contracts/attachments/attachment';
import type { AttachmentRow } from '../repository/attachment.repository';

export const toAttachmentDto = (row: AttachmentRow): Attachment =>
  AttachmentSchema.parse({
    id: row.id,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    isImage: row.isImage,
    url: attachmentContentPath(row.workspaceId, row.id),
    uploadedBy: row.uploadedBy,
    createdAt: row.createdAt.toISOString(),
  });
