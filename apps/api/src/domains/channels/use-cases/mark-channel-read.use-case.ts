import { Inject, Injectable } from '@nestjs/common';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { assertCanAccessChannel } from '../helpers/channel-access.helper';
import { ChannelRepository } from '../repository/channel.repository';

@Injectable()
export class MarkChannelReadUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
  ) {}

  async execute(actorId: string, workspaceId: string, channelId: string): Promise<void> {
    const [actor, channel] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.channels.findAccessFacts(workspaceId, channelId, actorId),
    ]);
    const member = assertIsMember(actor);
    assertCanAccessChannel(member.role, channel);
    await this.channels.markRead(channelId, actorId, new Date());
  }
}
