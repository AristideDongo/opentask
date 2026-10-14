import { Inject, Injectable } from '@nestjs/common';
import type { Task, TaskQuery } from '@opentask/contracts/tasks/task';
import { ProjectNotFoundError } from '../../projects/errors/project.errors';
import { ProjectRepository } from '../../projects/repository/project.repository';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { toTaskDto } from '../mappers/task.mapper';
import { TaskRepository } from '../repository/task.repository';

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    projectId: string,
    query: TaskQuery,
  ): Promise<Task[]> {
    const [membership, project] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.projects.findById(workspaceId, projectId),
    ]);
    assertIsMember(membership);
    if (!project) throw new ProjectNotFoundError();
    return (await this.tasks.list(projectId, query)).map(toTaskDto);
  }
}
