import { Inject, Injectable } from '@nestjs/common';
import type { Channel } from '@opentask/contracts/channels/channel';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { canAccessChannel, canManageChannel } from '../helpers/channel-access.helper';
import { toChannelDto } from '../mappers/channel.mapper';
import { ChannelRepository } from '../repository/channel.repository';

@Injectable()
export class ListChannelsUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
  ) {}

  async execute(actorId: string, workspaceId: string): Promise<Channel[]> {
    const [actor, channels] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.channels.listWithUserState(workspaceId, actorId),
    ]);
    const member = assertIsMember(actor);
    return channels
      .filter((c) => canAccessChannel(member.role, c))
      .map((c) => toChannelDto(c, canManageChannel(member, c)));
  }
}
