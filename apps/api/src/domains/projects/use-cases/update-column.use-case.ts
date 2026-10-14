import { Inject, Injectable } from '@nestjs/common';
import type { Column, UpdateColumnInput } from '@opentask/contracts/projects/column';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ColumnNotFoundError, ProjectNotFoundError } from '../errors/project.errors';
import { columnPosition } from '../helpers/column.helper';
import { toColumnDto } from '../mappers/project.mapper';
import { ColumnRepository } from '../repository/column.repository';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class UpdateColumnUseCase {
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
    columnId: string,
    input: UpdateColumnInput,
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
      const current = columns.find((c) => c.id === columnId);
      if (!current) throw new ColumnNotFoundError();
      const { beforeColumnId, ...fields } = input;
      const position =
        beforeColumnId === undefined
          ? undefined
          : columnPosition(columns, beforeColumnId, columnId);
      const updated = await this.columns.update(columnId, { ...fields, position });
      if (input.category && input.category !== current.category) {
        await this.columns.syncTaskStatus(columnId, input.category, new Date());
      }
      return updated;
    });
    this.realtime.publish(workspaceId, { type: 'project.changed', projectId }, EVERYONE);
    return toColumnDto(column);
  }
}
