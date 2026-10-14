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
