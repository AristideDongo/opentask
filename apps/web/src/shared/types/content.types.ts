export interface AttachmentVM {
  id: string;
  fileName: string;
  size: number;
  isImage: boolean;
  url: string;
  canDelete: boolean;
}

export type TextSegmentVM =
  { type: 'text'; text: string } | { type: 'mention'; id: string; name: string; isMe: boolean };

export interface MentionRefVM {
  id: string;
  name: string;
}
