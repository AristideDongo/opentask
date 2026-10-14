import { Inject, Injectable } from '@nestjs/common';
import type { Label } from '@opentask/contracts/projects/label';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ProjectNotFoundError } from '../errors/project.errors';
import { toLabelDto } from '../mappers/project.mapper';
import { LabelRepository } from '../repository/label.repository';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class ListLabelsUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(LabelRepository) private readonly labels: LabelRepository,
  ) {}

  async execute(actorId: string, workspaceId: string, projectId: string): Promise<Label[]> {
    const [membership, project, labels] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.projects.findById(workspaceId, projectId),
      this.labels.list(projectId),
    ]);
    assertIsMember(membership);
    if (!project) throw new ProjectNotFoundError();
    return labels.map(toLabelDto);
  }
}
