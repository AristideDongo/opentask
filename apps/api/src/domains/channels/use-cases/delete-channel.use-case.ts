import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { StorageService } from '../../../infrastructures/storage/storage.service';
import { AttachmentRepository } from '../../attachments/repository/attachment.repository';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { AuditLogRepository } from '../../workspaces/repository/audit-log.repository';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import {
  assertCanAccessChannel,
  assertCanManageChannel,
  channelAudience,
} from '../helpers/channel-access.helper';
import { ChannelRepository } from '../repository/channel.repository';

@Injectable()
export class DeleteChannelUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ChannelRepository) private readonly channels: ChannelRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(AttachmentRepository) private readonly attachments: AttachmentRepository,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, channelId: string): Promise<void> {
    const { audience, storageKeys } = await this.prisma.transaction(async () => {
      const [actor, channel] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.channels.findAccessFacts(workspaceId, channelId, actorId),
      ]);
      const member = assertIsMember(actor);
      assertCanAccessChannel(member.role, channel);
      assertCanManageChannel(member, channel);
      const memberIds = (await this.channels.members(channelId)).map((m) => m.id);
      const storageKeys = await this.attachments.storageKeys({ message: { channelId } });
      await this.channels.delete(channelId);
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'channel.deleted',
        targetType: 'channel',
        targetId: channelId,
        metadata: { name: channel.name },
      });
      return { audience: channelAudience(channel.isPrivate, memberIds), storageKeys };
    });
    await this.storage.remove(storageKeys);
    this.realtime.publish(workspaceId, { type: 'channel.deleted', channelId }, audience);
  }
}
