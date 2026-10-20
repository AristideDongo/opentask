import { Inject, Injectable } from '@nestjs/common';
import type { Message } from '@opentask/contracts/channels/message';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { extractMentionIds } from '@opentask/contracts/mentions/mention';
import {
  canSeeChannel,
  mentionExcerpt,
  newlyMentioned,
} from '../../mentions/helpers/mention.helper';
import { MentionRepository } from '../../mentions/repository/mention.repository';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { MessageNotFoundError } from '../errors/channel.errors';
import {
  assertCanAccessChannel,
  assertCanEditMessage,
  channelAudience,
} from '../helpers/channel-access.helper';
import { toMessageDto } from '../mappers/message.mapper';
import { ChannelRepository } from '../repository/channel.repository';
import { MessageRepository } from '../repository/message.repository';

@Injectable()
export class EditMessageUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
    @Inject(MessageRepository) private readonly messages: MessageRepository,
    @Inject(MentionRepository) private readonly mentions: MentionRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    channelId: string,
    messageId: string,
    body: string,
  ): Promise<Message> {
    const { message, audience, previous, channelName } = await this.prisma.transaction(async () => {
      const [actor, channel] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.channels.findAccessFacts(workspaceId, channelId, actorId),
      ]);
      const member = assertIsMember(actor);
      assertCanAccessChannel(member.role, channel);
      const current = await this.messages.findById(channelId, messageId);
      if (!current) throw new MessageNotFoundError();
      assertCanEditMessage(actorId, current);
      const previous = await this.mentions.messageMentionIds(messageId);
      await this.messages.update(messageId, { body, editedAt: new Date() });
      const candidates = await this.mentions.candidates(
        workspaceId,
        extractMentionIds(body),
        channelId,
      );
      await this.mentions.setMessageMentions(
        messageId,
        candidates.filter((c) => canSeeChannel(c, channel.isPrivate)).map((c) => c.id),
      );
      const memberIds = (await this.channels.members(channelId)).map((m) => m.id);
      return {
        message: toMessageDto(await this.messages.reload(messageId)),
        audience: channelAudience(channel.isPrivate, memberIds),
        previous,
        channelName: channel.name,
      };
    });
    this.realtime.publish(workspaceId, { type: 'message.updated', message }, audience);
    for (const mentioned of newlyMentioned(previous, message.mentions, actorId)) {
      this.realtime.publish(
        workspaceId,
        {
          type: 'mention.created',
          by: message.author ?? { id: actorId, name: '' },
          excerpt: mentionExcerpt(message.body, message.mentions),
          target: { kind: 'message', channelId, channelName, messageId },
        },
        { userIds: [mentioned.id] },
      );
    }
    return message;
  }
}
