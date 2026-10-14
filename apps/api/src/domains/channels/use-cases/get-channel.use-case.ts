import { Inject, Injectable } from '@nestjs/common';
import type { Channel } from '@opentask/contracts/channels/channel';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ChannelNotFoundError } from '../errors/channel.errors';
import { canAccessChannel, canManageChannel } from '../helpers/channel-access.helper';
import { toChannelDto } from '../mappers/channel.mapper';
import { ChannelRepository } from '../repository/channel.repository';

@Injectable()
export class GetChannelUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
  ) {}

  async execute(actorId: string, workspaceId: string, channelId: string): Promise<Channel> {
    const [actor, [channel]] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.channels.listWithUserState(workspaceId, actorId, channelId),
    ]);
    const member = assertIsMember(actor);
    if (!channel || !canAccessChannel(member.role, channel)) throw new ChannelNotFoundError();
    return toChannelDto(channel, canManageChannel(member, channel));
  }
}
