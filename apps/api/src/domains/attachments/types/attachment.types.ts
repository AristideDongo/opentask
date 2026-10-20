import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface AttachmentAccessFacts {
  uploadedById: string | null;
  taskId: string | null;
  message: {
    authorId: string | null;
    channel: { isPrivate: boolean; isChannelMember: boolean };
  } | null;
}

export interface AttachmentActor {
  userId: string;
  role: WorkspaceRole;
}

export interface StoredFileFacts {
  fileName: string;
  mimeType: string;
  isImage: boolean;
}
