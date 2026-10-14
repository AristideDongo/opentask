import { type Channel, ChannelSchema } from '@opentask/contracts/channels/channel';
import type { ChannelStateRow } from '../repository/channel.repository';

export const toChannelDto = (row: ChannelStateRow, canManage: boolean): Channel =>
  ChannelSchema.parse({
    id: row.id,
    name: row.name,
    description: row.description,
    isPrivate: row.isPrivate,
    isMember: row.isChannelMember,
    canManage,
    unreadCount: row.unreadCount,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  });
