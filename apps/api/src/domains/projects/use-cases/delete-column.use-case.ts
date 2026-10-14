import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ColumnNotFoundError, ProjectNotFoundError } from '../errors/project.errors';
import { assertColumnCanBeDeleted } from '../helpers/column.helper';
import { ColumnRepository } from '../repository/column.repository';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class DeleteColumnUseCase {
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
    moveTasksTo: string | null,
  ): Promise<void> {
    await this.prisma.transaction(async () => {
      const [actor, project, columns, taskCount] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.projects.findById(workspaceId, projectId),
        this.columns.list(projectId),
        this.columns.countTasks(columnId),
      ]);
      const member = assertIsMember(actor);
      if (!project) throw new ProjectNotFoundError();
      assertCan(member.role, 'project.update');
      if (!columns.some((c) => c.id === columnId)) throw new ColumnNotFoundError();
      const destination = assertColumnCanBeDeleted(columns, columnId, taskCount, moveTasksTo);
      if (destination)
        await this.columns.moveTasks(columnId, destination.id, destination.category, new Date());
      await this.columns.delete(columnId);
    });
    this.realtime.publish(workspaceId, { type: 'project.changed', projectId }, EVERYONE);
  }
}
