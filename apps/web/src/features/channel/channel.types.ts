import type { MessageVM } from '../../shared/types/channel.types';

export interface ChannelMessageVM extends MessageVM {
  canEdit: boolean;
  canDelete: boolean;
}

export interface MessageRowVM {
  message: ChannelMessageVM;
  showDay: boolean;
  compact: boolean;
}

export interface MessagePageVM {
  messages: ChannelMessageVM[];
  nextCursor: string | null;
}

export interface MessageViewer {
  meId: string;
  canModerate: boolean;
}

export type PendingUploadStatus = 'uploading' | 'done' | 'error';

export interface PendingUploadVM {
  key: string;
  fileName: string;
  status: PendingUploadStatus;
  attachmentId: string | null;
  error: string | null;
}

export interface MentionCandidateVM {
  id: string;
  name: string;
  initials: string;
}
