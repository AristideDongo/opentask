import { Inject, Injectable } from '@nestjs/common';
import type { CreateWorkspaceInput, Workspace } from '@opentask/contracts/workspaces/workspace';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { toWorkspaceDto } from '../mappers/workspace.mapper';
import { AuditLogRepository } from '../repository/audit-log.repository';
import { WorkspaceRepository } from '../repository/workspace.repository';

@Injectable()
export class CreateWorkspaceUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
  ) {}

  execute(actorId: string, input: CreateWorkspaceInput): Promise<Workspace> {
    return this.prisma.transaction(async () => {
      const workspace = await this.workspaces.createWithOwner({
        name: input.name,
        ownerId: actorId,
      });
      await this.audit.record({
        workspaceId: workspace.id,
        actorId,
        action: 'workspace.created',
        targetType: 'workspace',
        targetId: workspace.id,
        metadata: { name: workspace.name },
      });
      return toWorkspaceDto(workspace, 'owner', 1);
    });
  }
}
