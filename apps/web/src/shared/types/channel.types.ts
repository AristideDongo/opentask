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
  isDeleted: boolean;
  isEdited: boolean;
  isMine: boolean;
  createdAt: string;
}
