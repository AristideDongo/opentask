import { Inject, Injectable } from '@nestjs/common';
import { decideTaskDeletion } from '@opentask/contracts/workspaces/permissions';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
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
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, taskId: string): Promise<void> {
    const task = await this.prisma.transaction(async () => {
      const [actor, current] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.tasks.findById(workspaceId, taskId),
      ]);
      const member = assertIsMember(actor);
      if (!current) throw new TaskNotFoundError();
      assertAllowed(decideTaskDeletion(member, current));
      await this.tasks.delete(taskId);
      return current;
    });
    this.realtime.publish(
      workspaceId,
      { type: 'task.deleted', projectId: task.projectId, taskId },
      EVERYONE,
    );
  }
}
