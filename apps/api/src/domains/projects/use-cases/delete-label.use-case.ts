import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { LabelNotFoundError, ProjectNotFoundError } from '../errors/project.errors';
import { LabelRepository } from '../repository/label.repository';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class DeleteLabelUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(LabelRepository) private readonly labels: LabelRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    projectId: string,
    labelId: string,
  ): Promise<void> {
    await this.prisma.transaction(async () => {
      const [actor, project, label] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.projects.findById(workspaceId, projectId),
        this.labels.findById(projectId, labelId),
      ]);
      const member = assertIsMember(actor);
      if (!project) throw new ProjectNotFoundError();
      assertCan(member.role, 'task.write');
      if (!label) throw new LabelNotFoundError();
      await this.labels.delete(labelId);
    });
    this.realtime.publish(workspaceId, { type: 'project.changed', projectId }, EVERYONE);
  }
}
