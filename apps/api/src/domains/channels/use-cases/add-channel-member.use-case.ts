import { Inject, Injectable } from '@nestjs/common';
import type { Ref } from '@opentask/contracts/common/primitives';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertAllMembers, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import {
  assertCanAccessChannel,
  assertCanAddChannelMember,
  channelAudience,
} from '../helpers/channel-access.helper';
import { ChannelRepository } from '../repository/channel.repository';

@Injectable()
export class AddChannelMemberUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    channelId: string,
    userId: string,
  ): Promise<Ref[]> {
    const { members, isPrivate } = await this.prisma.transaction(async () => {
      const [actor, channel] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.channels.findAccessFacts(workspaceId, channelId, actorId),
      ]);
      const member = assertIsMember(actor);
      assertCanAccessChannel(member.role, channel);
      assertCanAddChannelMember(member.role);
      assertAllMembers([userId], await this.memberships.memberIdsAmong(workspaceId, [userId]));
      await this.channels.addMember(workspaceId, channelId, userId);
      return { members: await this.channels.members(channelId), isPrivate: channel.isPrivate };
    });
    const audience = channelAudience(
      isPrivate,
      members.map((m) => m.id),
    );
    this.realtime.publish(workspaceId, { type: 'channel.changed', channelId }, audience);
    return members;
  }
}
