import { Inject, Injectable } from '@nestjs/common';
import type { Label, UpdateLabelInput } from '@opentask/contracts/projects/label';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { LabelNotFoundError, ProjectNotFoundError } from '../errors/project.errors';
import { toLabelDto } from '../mappers/project.mapper';
import { LabelRepository } from '../repository/label.repository';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class UpdateLabelUseCase {
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
    input: UpdateLabelInput,
  ): Promise<Label> {
    const label = await this.prisma.transaction(async () => {
      const [actor, project, current] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.projects.findById(workspaceId, projectId),
        this.labels.findById(projectId, labelId),
      ]);
      const member = assertIsMember(actor);
      if (!project) throw new ProjectNotFoundError();
      assertCan(member.role, 'task.write');
      if (!current) throw new LabelNotFoundError();
      return this.labels.update(labelId, input);
    });
    this.realtime.publish(workspaceId, { type: 'project.changed', projectId }, EVERYONE);
    return toLabelDto(label);
  }
}
