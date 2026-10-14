import { Inject, Injectable } from '@nestjs/common';
import type { TaskDetail } from '@opentask/contracts/tasks/task';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { TaskNotFoundError } from '../errors/task.errors';
import { toTaskDetailDto } from '../mappers/task.mapper';
import { CommentRepository } from '../repository/comment.repository';
import { TaskRepository } from '../repository/task.repository';

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
    @Inject(CommentRepository) private readonly comments: CommentRepository,
  ) {}

  async execute(actorId: string, workspaceId: string, taskId: string): Promise<TaskDetail> {
    const [membership, task] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.tasks.findView(workspaceId, taskId),
    ]);
    assertIsMember(membership);
    if (!task) throw new TaskNotFoundError();
    const [projectName, subtasks, comments] = await Promise.all([
      this.tasks.projectName(task.projectId),
      this.tasks.listSubtasks(task.id),
      this.comments.listForTask(task.id),
    ]);
    return toTaskDetailDto(task, projectName, subtasks, comments);
  }
}
