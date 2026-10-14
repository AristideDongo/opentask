import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { Prisma } from '@opentask/database/client';
import { ChannelNameTakenError } from '../errors/channel.errors';

const UNIQUE_VIOLATION_CODE = 'P2002';
const userRef = { select: { id: true, name: true } } as const;

async function withUniqueNameMapped<T>(write: Promise<T>): Promise<T> {
  try {
    return await write;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_VIOLATION_CODE
    ) {
      throw new ChannelNameTakenError();
    }
    throw error;
  }
}

export interface ChannelStateRow {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  createdById: string | null;
  createdBy: { id: string; name: string } | null;
  createdAt: Date;
  isChannelMember: boolean;
  unreadCount: number;
}

@Injectable()
export class ChannelRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: {
    workspaceId: string;
    name: string;
    description: string;
    isPrivate: boolean;
    createdById: string;
    memberIds: string[];
  }) {
    const { memberIds, ...channel } = data;
    return withUniqueNameMapped(
      this.prisma.db.channel.create({
        data: {
          ...channel,
          members: {
            create: [...new Set(memberIds)].map((userId) => ({
              workspaceId: data.workspaceId,
              userId,
            })),
          },
        },
      }),
    );
  }

  async findAccessFacts(workspaceId: string, id: string, userId: string) {
    const channel = await this.prisma.db.channel.findFirst({
      where: { id, workspaceId },
      include: { members: { where: { userId }, select: { userId: true } } },
    });
    if (!channel) return null;
    const { members, ...rest } = channel;
    return { ...rest, isChannelMember: members.length > 0 };
  }

  async listWithUserState(
    workspaceId: string,
    userId: string,
    id?: string,
  ): Promise<ChannelStateRow[]> {
    const channels = await this.prisma.db.channel.findMany({
      where: { workspaceId, ...(id ? { id } : {}) },
      include: { createdBy: userRef, members: { where: { userId }, select: { userId: true } } },
      orderBy: { name: 'asc' },
    });
    if (channels.length === 0) return [];
    const unread = await this.prisma.db.$queryRaw<{ channel_id: string; count: bigint }[]>`
      SELECT m.channel_id, count(*) AS count
      FROM messages m
      LEFT JOIN channel_reads r ON r.channel_id = m.channel_id AND r.user_id = ${userId}
      WHERE m.channel_id IN (${Prisma.join(channels.map((c) => c.id))})
        AND m.deleted_at IS NULL
        AND m.author_id IS DISTINCT FROM ${userId}
        AND (r.last_read_at IS NULL OR m.created_at > r.last_read_at)
      GROUP BY m.channel_id`;
    const unreadBy = new Map(unread.map((u) => [u.channel_id, Number(u.count)]));
    return channels.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      isPrivate: c.isPrivate,
      createdById: c.createdById,
      createdBy: c.createdBy,
      createdAt: c.createdAt,
      isChannelMember: c.members.length > 0,
      unreadCount: unreadBy.get(c.id) ?? 0,
    }));
  }

  async members(channelId: string) {
    const rows = await this.prisma.db.channelMember.findMany({
      where: { channelId },
      include: { membership: { include: { user: userRef } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => r.membership.user);
  }

  async update(id: string, data: { name?: string; description?: string }) {
    await withUniqueNameMapped(this.prisma.db.channel.update({ where: { id }, data }));
  }

  async delete(id: string) {
    await this.prisma.db.channel.delete({ where: { id } });
  }

  async addMember(workspaceId: string, channelId: string, userId: string) {
    await this.prisma.db.channelMember.createMany({
      data: [{ channelId, workspaceId, userId }],
      skipDuplicates: true,
    });
  }

  async removeMember(channelId: string, userId: string) {
    await this.prisma.db.channelMember.deleteMany({ where: { channelId, userId } });
  }

  async markRead(channelId: string, userId: string, at: Date) {
    await this.prisma.db.channelRead.upsert({
      where: { channelId_userId: { channelId, userId } },
      create: { channelId, userId, lastReadAt: at },
      update: { lastReadAt: at },
    });
  }
}
