import { Inject, Injectable } from '@nestjs/common';
import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import type { MentionCandidate } from '../types/mention.types';

@Injectable()
export class MentionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async candidates(
    workspaceId: string,
    userIds: string[],
    channelId?: string,
  ): Promise<MentionCandidate[]> {
    if (userIds.length === 0) return [];
    const rows = await this.prisma.db.workspaceMember.findMany({
      where: { workspaceId, userId: { in: userIds } },
      select: {
        role: true,
        user: { select: { id: true, name: true } },
        channels: { where: { channelId: channelId ?? '' }, select: { channelId: true } },
      },
    });
    return rows.map((row) => ({
      id: row.user.id,
      name: row.user.name,
      role: row.role as WorkspaceRole,
      isChannelMember: row.channels.length > 0,
    }));
  }

  async messageMentionIds(messageId: string) {
    const rows = await this.prisma.db.messageMention.findMany({
      where: { messageId },
      select: { userId: true },
    });
    return rows.map((row) => row.userId);
  }

  async setMessageMentions(messageId: string, userIds: string[]) {
    await this.prisma.db.messageMention.deleteMany({ where: { messageId } });
    if (userIds.length)
      await this.prisma.db.messageMention.createMany({
        data: userIds.map((userId) => ({ messageId, userId })),
      });
  }

  async setCommentMentions(commentId: string, userIds: string[]) {
    if (userIds.length)
      await this.prisma.db.commentMention.createMany({
        data: userIds.map((userId) => ({ commentId, userId })),
      });
  }
}
