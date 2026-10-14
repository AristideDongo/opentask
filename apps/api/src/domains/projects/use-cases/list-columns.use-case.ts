import { Inject, Injectable } from '@nestjs/common';
import type { Column } from '@opentask/contracts/projects/column';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ProjectNotFoundError } from '../errors/project.errors';
import { toColumnDto } from '../mappers/project.mapper';
import { ColumnRepository } from '../repository/column.repository';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class ListColumnsUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(ColumnRepository) private readonly columns: ColumnRepository,
  ) {}

  async execute(actorId: string, workspaceId: string, projectId: string): Promise<Column[]> {
    const [membership, project, columns] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.projects.findById(workspaceId, projectId),
      this.columns.list(projectId),
    ]);
    assertIsMember(membership);
    if (!project) throw new ProjectNotFoundError();
    return columns.map(toColumnDto);
  }
}
