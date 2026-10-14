import { Inject, Injectable } from '@nestjs/common';
import type { Column } from '@opentask/contracts/projects/column';
import type { TaskStatus } from '@opentask/contracts/tasks/status';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ProjectNotFoundError, TooManyColumnsError } from '../errors/project.errors';
import { columnPosition } from '../helpers/column.helper';
import { toColumnDto } from '../mappers/project.mapper';
import { MAX_COLUMNS_PER_PROJECT } from '../projects.const';
import { ColumnRepository } from '../repository/column.repository';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class CreateColumnUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(ColumnRepository) private readonly columns: ColumnRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    projectId: string,
    input: { name: string; category: TaskStatus; beforeColumnId: string | null },
  ): Promise<Column> {
    const column = await this.prisma.transaction(async () => {
      const [actor, project, columns] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.projects.findById(workspaceId, projectId),
        this.columns.list(projectId),
      ]);
      const member = assertIsMember(actor);
      if (!project) throw new ProjectNotFoundError();
      assertCan(member.role, 'project.update');
      if (columns.length >= MAX_COLUMNS_PER_PROJECT) throw new TooManyColumnsError();
      return this.columns.create({
        workspaceId,
        projectId,
        name: input.name,
        category: input.category,
        position: columnPosition(columns, input.beforeColumnId),
      });
    });
    this.realtime.publish(workspaceId, { type: 'project.changed', projectId }, EVERYONE);
    return toColumnDto(column);
  }
}
