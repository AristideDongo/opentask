import { type Message, MessageSchema } from '@opentask/contracts/channels/message';

interface MessageRow {
  id: string;
  channelId: string;
  body: string;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  author: { id: string; name: string } | null;
}

export const toMessageDto = (m: MessageRow): Message =>
  MessageSchema.parse({
    id: m.id,
    channelId: m.channelId,
    author: m.author,
    body: m.deletedAt ? '' : m.body,
    editedAt: m.editedAt?.toISOString() ?? null,
    deletedAt: m.deletedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  });
