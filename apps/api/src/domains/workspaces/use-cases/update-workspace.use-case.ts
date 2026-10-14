import { Inject, Injectable } from '@nestjs/common';
import type { UpdateWorkspaceInput, Workspace } from '@opentask/contracts/workspaces/workspace';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { assertCan, assertIsMember } from '../helpers/access.helper';
import { toMemberWorkspaceDto } from '../mappers/workspace.mapper';
import { AuditLogRepository } from '../repository/audit-log.repository';
import { WorkspaceRepository } from '../repository/workspace.repository';

@Injectable()
export class UpdateWorkspaceUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
  ) {}

  execute(actorId: string, workspaceId: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    return this.prisma.transaction(async () => {
      const actor = assertIsMember(await this.workspaces.findForMember(workspaceId, actorId));
      assertCan(actor.role, 'workspace.update');
      await this.workspaces.update(workspaceId, { name: input.name });
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'workspace.updated',
        targetType: 'workspace',
        targetId: workspaceId,
        metadata: { name: { from: actor.workspace.name, to: input.name } },
      });
      return toMemberWorkspaceDto(
        assertIsMember(await this.workspaces.findForMember(workspaceId, actorId)),
      );
    });
  }
}
