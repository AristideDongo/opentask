import { Inject, Injectable } from '@nestjs/common';
import type { Message } from '@opentask/contracts/channels/message';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { MessageNotFoundError } from '../errors/channel.errors';
import {
  assertCanAccessChannel,
  assertCanDeleteMessage,
  channelAudience,
} from '../helpers/channel-access.helper';
import { toMessageDto } from '../mappers/message.mapper';
import { ChannelRepository } from '../repository/channel.repository';
import { MessageRepository } from '../repository/message.repository';

@Injectable()
export class DeleteMessageUseCase {
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
    messageId: string,
  ): Promise<Message> {
    const { message, audience } = await this.prisma.transaction(async () => {
      const [actor, channel] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.channels.findAccessFacts(workspaceId, channelId, actorId),
      ]);
      const member = assertIsMember(actor);
      assertCanAccessChannel(member.role, channel);
      const current = await this.messages.findById(channelId, messageId);
      if (!current) throw new MessageNotFoundError();
      assertCanDeleteMessage(member, current);
      const deleted = await this.messages.softDelete(messageId, new Date());
      const memberIds = (await this.channels.members(channelId)).map((m) => m.id);
      return {
        message: toMessageDto(deleted),
        audience: channelAudience(channel.isPrivate, memberIds),
      };
    });
    this.realtime.publish(workspaceId, { type: 'message.deleted', message }, audience);
    return message;
  }
}
