import { Inject, Injectable } from '@nestjs/common';
import type { Project } from '@opentask/contracts/projects/project';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { toProjectDto } from '../mappers/project.mapper';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
  ) {}

  async execute(actorId: string, workspaceId: string): Promise<Project[]> {
    assertIsMember(await this.memberships.find(workspaceId, actorId));
    return (await this.projects.list(workspaceId)).map(toProjectDto);
  }
}
