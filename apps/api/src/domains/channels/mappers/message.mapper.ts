import { type Message, MessageSchema } from '@opentask/contracts/channels/message';
import { toAttachmentDto } from '../../attachments/mappers/attachment.mapper';
import type { MessageRow } from '../repository/message.repository';

export const toMessageDto = (m: MessageRow): Message =>
  MessageSchema.parse({
    id: m.id,
    channelId: m.channelId,
    author: m.author,
    body: m.deletedAt ? '' : m.body,
    attachments: m.deletedAt ? [] : m.attachments.map(toAttachmentDto),
    mentions: m.deletedAt ? [] : m.mentions.map((mention) => mention.user),
    editedAt: m.editedAt?.toISOString() ?? null,
    deletedAt: m.deletedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  });
