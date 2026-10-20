import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from '../../../infrastructures/storage/storage.service';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { assertCanReadAttachment, downloadHeaders } from '../helpers/attachment.helper';
import { AttachmentRepository } from '../repository/attachment.repository';

@Injectable()
export class GetAttachmentContentUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(AttachmentRepository) private readonly attachments: AttachmentRepository,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {}

  async execute(actorId: string, workspaceId: string, attachmentId: string) {
    const [membership, row] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.attachments.findWithAccess(workspaceId, attachmentId, actorId),
    ]);
    const member = assertIsMember(membership);
    const facts = row && {
      uploadedById: row.uploadedById,
      taskId: row.taskId,
      message: row.message && {
        authorId: row.message.authorId,
        channel: {
          isPrivate: row.message.channel.isPrivate,
          isChannelMember: row.message.channel.members.length > 0,
        },
      },
    };
    assertCanReadAttachment({ userId: actorId, role: member.role }, facts);
    return {
      headers: { ...downloadHeaders(row!), 'Content-Length': String(row!.size) },
      stream: this.storage.read(row!.storageKey),
    };
  }
}
