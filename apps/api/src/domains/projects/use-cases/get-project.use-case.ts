import { Inject, Injectable } from '@nestjs/common';
import type { Project } from '@opentask/contracts/projects/project';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ProjectNotFoundError } from '../errors/project.errors';
import { toProjectDto } from '../mappers/project.mapper';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class GetProjectUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
  ) {}

  async execute(actorId: string, workspaceId: string, projectId: string): Promise<Project> {
    const [membership, project] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.projects.findView(workspaceId, projectId),
    ]);
    assertIsMember(membership);
    if (!project) throw new ProjectNotFoundError();
    return toProjectDto(project);
  }
}
