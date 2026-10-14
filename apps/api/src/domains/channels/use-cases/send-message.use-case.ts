import { Inject, Injectable } from '@nestjs/common';
import type { Message } from '@opentask/contracts/channels/message';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { assertCanAccessChannel, channelAudience } from '../helpers/channel-access.helper';
import { toMessageDto } from '../mappers/message.mapper';
import { ChannelRepository } from '../repository/channel.repository';
import { MessageRepository } from '../repository/message.repository';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
    @Inject(MessageRepository) private readonly messages: MessageRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    channelId: string,
    body: string,
  ): Promise<Message> {
    const { message, audience } = await this.prisma.transaction(async () => {
      const [actor, channel] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.channels.findAccessFacts(workspaceId, channelId, actorId),
      ]);
      const member = assertIsMember(actor);
      assertCanAccessChannel(member.role, channel);
      const created = await this.messages.create({
        workspaceId,
        channelId,
        authorId: actorId,
        body,
      });
      await this.channels.markRead(channelId, actorId, created.createdAt);
      const memberIds = (await this.channels.members(channelId)).map((m) => m.id);
      return {
        message: toMessageDto(created),
        audience: channelAudience(channel.isPrivate, memberIds),
      };
    });
    this.realtime.publish(workspaceId, { type: 'message.created', message }, audience);
    return message;
  }
}
