import { Inject, Injectable } from '@nestjs/common';
import type { Project, UpdateProjectInput } from '@opentask/contracts/projects/project';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ProjectNotFoundError, UnknownTeamError } from '../errors/project.errors';
import { toProjectDto } from '../mappers/project.mapper';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    const project = await this.prisma.transaction(async () => {
      const [actor, current, teamExists] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.projects.findById(workspaceId, projectId),
        input.teamId ? this.projects.teamExists(workspaceId, input.teamId) : Promise.resolve(true),
      ]);
      const member = assertIsMember(actor);
      if (!current) throw new ProjectNotFoundError();
      assertCan(member.role, 'project.update');
      if (!teamExists) throw new UnknownTeamError();
      await this.projects.update(projectId, input);
      const view = await this.projects.findView(workspaceId, projectId);
      if (!view) throw new ProjectNotFoundError();
      return toProjectDto(view);
    });
    this.realtime.publish(workspaceId, { type: 'project.changed', projectId }, EVERYONE);
    return project;
  }
}
