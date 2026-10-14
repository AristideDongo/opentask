import { Inject, Injectable } from '@nestjs/common';
import type { Channel } from '@opentask/contracts/channels/channel';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import {
  assertAllMembers,
  assertCan,
  assertIsMember,
} from '../../workspaces/helpers/access.helper';
import { AuditLogRepository } from '../../workspaces/repository/audit-log.repository';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ChannelNotFoundError } from '../errors/channel.errors';
import { canManageChannel, channelAudience } from '../helpers/channel-access.helper';
import { toChannelDto } from '../mappers/channel.mapper';
import { ChannelRepository } from '../repository/channel.repository';

@Injectable()
export class CreateChannelUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    input: { name: string; description: string; isPrivate: boolean; memberIds: string[] },
  ): Promise<Channel> {
    const memberIds = [...new Set(input.memberIds)];
    const { channel, member } = await this.prisma.transaction(async () => {
      const [actor, validIds] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.memberships.memberIdsAmong(workspaceId, memberIds),
      ]);
      const member = assertIsMember(actor);
      assertCan(member.role, 'channel.create');
      assertAllMembers(memberIds, validIds);
      const created = await this.channels.create({
        workspaceId,
        ...input,
        createdById: actorId,
        memberIds: [actorId, ...memberIds],
      });
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'channel.created',
        targetType: 'channel',
        targetId: created.id,
        metadata: { name: created.name, isPrivate: created.isPrivate },
      });
      const [state] = await this.channels.listWithUserState(workspaceId, actorId, created.id);
      if (!state) throw new ChannelNotFoundError();
      return { channel: state, member };
    });
    const audience = channelAudience(channel.isPrivate, [actorId, ...memberIds]);
    this.realtime.publish(
      workspaceId,
      { type: 'channel.changed', channelId: channel.id },
      audience,
    );
    return toChannelDto(channel, canManageChannel(member, channel));
  }
}
