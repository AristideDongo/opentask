import { Inject, Injectable } from '@nestjs/common';
import type { CreateLabelInput, Label } from '@opentask/contracts/projects/label';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ProjectNotFoundError, TooManyLabelsError } from '../errors/project.errors';
import { toLabelDto } from '../mappers/project.mapper';
import { MAX_LABELS_PER_PROJECT } from '../projects.const';
import { LabelRepository } from '../repository/label.repository';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class CreateLabelUseCase {
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
    input: CreateLabelInput,
  ): Promise<Label> {
    const label = await this.prisma.transaction(async () => {
      const [actor, project, count] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.projects.findById(workspaceId, projectId),
        this.labels.count(projectId),
      ]);
      const member = assertIsMember(actor);
      if (!project) throw new ProjectNotFoundError();
      assertCan(member.role, 'task.write');
      if (count >= MAX_LABELS_PER_PROJECT) throw new TooManyLabelsError();
      return this.labels.create({ workspaceId, projectId, ...input });
    });
    this.realtime.publish(workspaceId, { type: 'project.changed', projectId }, EVERYONE);
    return toLabelDto(label);
  }
}
