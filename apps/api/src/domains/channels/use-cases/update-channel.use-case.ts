import { Inject, Injectable } from '@nestjs/common';
import type { Channel, UpdateChannelInput } from '@opentask/contracts/channels/channel';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ChannelNotFoundError } from '../errors/channel.errors';
import {
  assertCanAccessChannel,
  assertCanManageChannel,
  channelAudience,
} from '../helpers/channel-access.helper';
import { toChannelDto } from '../mappers/channel.mapper';
import { ChannelRepository } from '../repository/channel.repository';

@Injectable()
export class UpdateChannelUseCase {
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
    input: UpdateChannelInput,
  ): Promise<Channel> {
    const { state, memberIds } = await this.prisma.transaction(async () => {
      const [actor, channel] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.channels.findAccessFacts(workspaceId, channelId, actorId),
      ]);
      const member = assertIsMember(actor);
      assertCanAccessChannel(member.role, channel);
      assertCanManageChannel(member, channel);
      await this.channels.update(channelId, input);
      const [state] = await this.channels.listWithUserState(workspaceId, actorId, channelId);
      if (!state) throw new ChannelNotFoundError();
      return { state, memberIds: (await this.channels.members(channelId)).map((m) => m.id) };
    });
    this.realtime.publish(
      workspaceId,
      { type: 'channel.changed', channelId },
      channelAudience(state.isPrivate, memberIds),
    );
    return toChannelDto(state, true);
  }
}
