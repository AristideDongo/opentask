import { Inject, Injectable } from '@nestjs/common';
import type { Project } from '@opentask/contracts/projects/project';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { UserRepository } from '../../users/repository/user.repository';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ProjectNotFoundError, UnknownTeamError } from '../errors/project.errors';
import { toProjectDto } from '../mappers/project.mapper';
import { DEFAULT_COLUMNS } from '../projects.const';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(UserRepository) private readonly users: UserRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    input: { name: string; description: string; teamId: string | null },
  ): Promise<Project> {
    const project = await this.prisma.transaction(async () => {
      const [actor, user, teamExists] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.users.findById(actorId),
        input.teamId ? this.projects.teamExists(workspaceId, input.teamId) : Promise.resolve(true),
      ]);
      assertCan(assertIsMember(actor).role, 'project.create');
      if (!teamExists) throw new UnknownTeamError();
      const columns = DEFAULT_COLUMNS[user?.locale === 'en' ? 'en' : 'fr'];
      const created = await this.projects.create({
        workspaceId,
        createdById: actorId,
        ...input,
        columns,
      });
      const view = await this.projects.findView(workspaceId, created.id);
      if (!view) throw new ProjectNotFoundError();
      return toProjectDto(view);
    });
    this.realtime.publish(
      workspaceId,
      { type: 'project.changed', projectId: project.id },
      EVERYONE,
    );
    return project;
  }
}
