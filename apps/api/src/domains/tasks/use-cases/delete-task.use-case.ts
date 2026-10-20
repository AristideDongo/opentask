import { Inject, Injectable } from '@nestjs/common';
import { decideTaskDeletion } from '@opentask/contracts/workspaces/permissions';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { StorageService } from '../../../infrastructures/storage/storage.service';
import { AttachmentRepository } from '../../attachments/repository/attachment.repository';
import { assertAllowed, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { TaskNotFoundError } from '../errors/task.errors';
import { TaskRepository } from '../repository/task.repository';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
    @Inject(AttachmentRepository) private readonly attachments: AttachmentRepository,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, taskId: string): Promise<void> {
    const { task, storageKeys } = await this.prisma.transaction(async () => {
      const [actor, current] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.tasks.findById(workspaceId, taskId),
      ]);
      const member = assertIsMember(actor);
      if (!current) throw new TaskNotFoundError();
      assertAllowed(decideTaskDeletion(member, current));
      const storageKeys = await this.attachments.storageKeys({
        OR: [{ taskId }, { task: { parentId: taskId } }],
      });
      await this.tasks.delete(taskId);
      return { task: current, storageKeys };
    });
    await this.storage.remove(storageKeys);
    this.realtime.publish(
      workspaceId,
      { type: 'task.deleted', projectId: task.projectId, taskId },
      EVERYONE,
    );
  }
}
