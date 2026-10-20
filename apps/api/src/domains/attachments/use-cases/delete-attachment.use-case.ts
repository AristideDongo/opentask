import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { StorageService } from '../../../infrastructures/storage/storage.service';
import { TaskRepository } from '../../tasks/repository/task.repository';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { assertCanDeleteAttachment, assertCanReadAttachment } from '../helpers/attachment.helper';
import { AttachmentRepository } from '../repository/attachment.repository';

@Injectable()
export class DeleteAttachmentUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(AttachmentRepository) private readonly attachments: AttachmentRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, attachmentId: string): Promise<void> {
    const { storageKey, task } = await this.prisma.transaction(async () => {
      const [membership, row] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.attachments.findWithAccess(workspaceId, attachmentId, actorId),
      ]);
      const member = assertIsMember(membership);
      const actor = { userId: actorId, role: member.role };
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
      assertCanReadAttachment(actor, facts);
      if (row!.taskId) assertCan(member.role, 'task.write');
      assertCanDeleteAttachment(actor, facts);
      const task = row!.taskId ? await this.tasks.findById(workspaceId, row!.taskId) : null;
      await this.attachments.delete(attachmentId);
      return { storageKey: row!.storageKey, task };
    });
    await this.storage.remove([storageKey]);
    if (task)
      this.realtime.publish(
        workspaceId,
        { type: 'task.changed', projectId: task.projectId, taskId: task.id },
        EVERYONE,
      );
  }
}
