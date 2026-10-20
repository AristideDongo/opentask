import type { Channel } from '@opentask/contracts/channels/channel';
import type { Message } from '@opentask/contracts/channels/message';
import type { ChannelVM, MessageVM } from '../types/channel.types';
import { toAttachmentVM, toTextSegments } from './content.mapper';
import { toPersonVM } from './person.mapper';

export const toChannelVM = (c: Channel): ChannelVM => ({
  id: c.id,
  name: c.name,
  description: c.description,
  isPrivate: c.isPrivate,
  isMember: c.isMember,
  canManage: c.canManage,
  unreadCount: c.unreadCount,
});

export const toMessageVM = (m: Message, meId: string): MessageVM => ({
  id: m.id,
  channelId: m.channelId,
  author: m.author ? toPersonVM(m.author) : null,
  body: m.body,
  segments: toTextSegments(m.body, m.mentions, meId),
  mentions: m.mentions,
  mentionsMe: m.mentions.some((mention) => mention.id === meId),
  attachments: m.attachments.map((a) => toAttachmentVM(a, { userId: meId, role: 'guest' })),
  isDeleted: m.deletedAt !== null,
  isEdited: m.editedAt !== null,
  isMine: m.author?.id === meId,
  createdAt: m.createdAt,
});
