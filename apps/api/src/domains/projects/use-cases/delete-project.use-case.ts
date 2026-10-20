import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { StorageService } from '../../../infrastructures/storage/storage.service';
import { AttachmentRepository } from '../../attachments/repository/attachment.repository';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { AuditLogRepository } from '../../workspaces/repository/audit-log.repository';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { ProjectNotFoundError } from '../errors/project.errors';
import { ProjectRepository } from '../repository/project.repository';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(AttachmentRepository) private readonly attachments: AttachmentRepository,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, projectId: string): Promise<void> {
    const storageKeys = await this.prisma.transaction(async () => {
      const [actor, project] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.projects.findById(workspaceId, projectId),
      ]);
      const member = assertIsMember(actor);
      if (!project) throw new ProjectNotFoundError();
      assertCan(member.role, 'project.delete');
      const storageKeys = await this.attachments.storageKeys({ task: { projectId } });
      await this.projects.delete(projectId);
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'project.deleted',
        targetType: 'project',
        targetId: projectId,
        metadata: { name: project.name },
      });
      return storageKeys;
    });
    await this.storage.remove(storageKeys);
    this.realtime.publish(workspaceId, { type: 'project.changed', projectId }, EVERYONE);
  }
}
