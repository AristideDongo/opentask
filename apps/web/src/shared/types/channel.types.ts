import type { AttachmentVM, MentionRefVM, TextSegmentVM } from './content.types';
import type { PersonVM } from './person.types';

export interface ChannelVM {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  isMember: boolean;
  canManage: boolean;
  unreadCount: number;
}

export interface MessageVM {
  id: string;
  channelId: string;
  author: PersonVM | null;
  body: string;
  segments: TextSegmentVM[];
  mentions: MentionRefVM[];
  mentionsMe: boolean;
  attachments: AttachmentVM[];
  isDeleted: boolean;
  isEdited: boolean;
  isMine: boolean;
  createdAt: string;
}
