import { Inject, Injectable } from '@nestjs/common';
import type { MessagePage } from '@opentask/contracts/channels/message';
import type { CursorQuery } from '@opentask/contracts/common/pagination';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { assertCanAccessChannel } from '../helpers/channel-access.helper';
import { toMessageDto } from '../mappers/message.mapper';
import { ChannelRepository } from '../repository/channel.repository';
import { MessageRepository } from '../repository/message.repository';

@Injectable()
export class ListMessagesUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
    @Inject(MessageRepository) private readonly messages: MessageRepository,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    channelId: string,
    query: CursorQuery,
  ): Promise<MessagePage> {
    const [actor, channel] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.channels.findAccessFacts(workspaceId, channelId, actorId),
    ]);
    const member = assertIsMember(actor);
    assertCanAccessChannel(member.role, channel);
    const page = await this.messages.list(channelId, query);
    return { items: page.items.map(toMessageDto), nextCursor: page.nextCursor };
  }
}
