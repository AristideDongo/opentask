import { Inject, Injectable } from '@nestjs/common';
import type { Message, MessageData } from '@opentask/contracts/channels/message';
import { extractMentionIds } from '@opentask/contracts/mentions/mention';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { AttachmentsUnavailableError } from '../../attachments/errors/attachment.errors';
import { AttachmentRepository } from '../../attachments/repository/attachment.repository';
import {
  canSeeChannel,
  mentionExcerpt,
  newlyMentioned,
} from '../../mentions/helpers/mention.helper';
import { MentionRepository } from '../../mentions/repository/mention.repository';
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
    @Inject(AttachmentRepository) private readonly attachments: AttachmentRepository,
    @Inject(MentionRepository) private readonly mentions: MentionRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    channelId: string,
    input: MessageData,
  ): Promise<Message> {
    const { message, audience, channelName } = await this.prisma.transaction(async () => {
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
        body: input.body,
      });
      const linked = await this.attachments.linkToMessage(
        input.attachmentIds,
        created.id,
        actorId,
        workspaceId,
      );
      if (linked !== input.attachmentIds.length) throw new AttachmentsUnavailableError();
      const candidates = await this.mentions.candidates(
        workspaceId,
        extractMentionIds(input.body),
        channelId,
      );
      await this.mentions.setMessageMentions(
        created.id,
        candidates.filter((c) => canSeeChannel(c, channel.isPrivate)).map((c) => c.id),
      );
      await this.channels.markRead(channelId, actorId, created.createdAt);
      const memberIds = (await this.channels.members(channelId)).map((m) => m.id);
      return {
        message: toMessageDto(await this.messages.reload(created.id)),
        audience: channelAudience(channel.isPrivate, memberIds),
        channelName: channel.name,
      };
    });
    this.realtime.publish(workspaceId, { type: 'message.created', message }, audience);
    for (const mentioned of newlyMentioned([], message.mentions, actorId)) {
      this.realtime.publish(
        workspaceId,
        {
          type: 'mention.created',
          by: message.author ?? { id: actorId, name: '' },
          excerpt: mentionExcerpt(message.body, message.mentions),
          target: { kind: 'message', channelId, channelName, messageId: message.id },
        },
        { userIds: [mentioned.id] },
      );
    }
    return message;
  }
}
