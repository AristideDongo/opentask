import { Inject, Injectable } from '@nestjs/common';
import type { TaskComment } from '@opentask/contracts/tasks/comment';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { TaskNotFoundError } from '../errors/task.errors';
import { toCommentDto } from '../mappers/task.mapper';
import { CommentRepository } from '../repository/comment.repository';
import { TaskRepository } from '../repository/task.repository';

@Injectable()
export class CommentTaskUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
    @Inject(CommentRepository) private readonly comments: CommentRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    taskId: string,
    body: string,
  ): Promise<TaskComment> {
    const { task, comment } = await this.prisma.transaction(async () => {
      const [actor, task] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.tasks.findById(workspaceId, taskId),
      ]);
      const member = assertIsMember(actor);
      if (!task) throw new TaskNotFoundError();
      assertCan(member.role, 'task.comment');
      return {
        task,
        comment: toCommentDto(
          await this.comments.create({ workspaceId, taskId, authorId: actorId, body }),
        ),
      };
    });
    this.realtime.publish(
      workspaceId,
      { type: 'task.commented', projectId: task.projectId, taskId, comment },
      EVERYONE,
    );
    return comment;
  }
}
