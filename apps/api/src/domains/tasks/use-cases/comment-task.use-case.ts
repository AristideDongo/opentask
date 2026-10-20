import { Inject, Injectable } from '@nestjs/common';
import { extractMentionIds } from '@opentask/contracts/mentions/mention';
import type { TaskComment } from '@opentask/contracts/tasks/comment';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { mentionExcerpt, newlyMentioned } from '../../mentions/helpers/mention.helper';
import { MentionRepository } from '../../mentions/repository/mention.repository';
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
    @Inject(MentionRepository) private readonly mentions: MentionRepository,
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
      const created = await this.comments.create({ workspaceId, taskId, authorId: actorId, body });
      const candidates = await this.mentions.candidates(workspaceId, extractMentionIds(body));
      await this.mentions.setCommentMentions(
        created.id,
        candidates.map((c) => c.id),
      );
      return { task, comment: toCommentDto(await this.comments.reload(created.id)) };
    });
    this.realtime.publish(
      workspaceId,
      { type: 'task.commented', projectId: task.projectId, taskId, comment },
      EVERYONE,
    );
    for (const mentioned of newlyMentioned([], comment.mentions, actorId)) {
      this.realtime.publish(
        workspaceId,
        {
          type: 'mention.created',
          by: comment.author ?? { id: actorId, name: '' },
          excerpt: mentionExcerpt(comment.body, comment.mentions),
          target: { kind: 'comment', projectId: task.projectId, taskId, taskTitle: task.title },
        },
        { userIds: [mentioned.id] },
      );
    }
    return comment;
  }
}
