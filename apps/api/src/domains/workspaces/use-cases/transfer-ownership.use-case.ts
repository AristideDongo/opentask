import { Inject, Injectable } from '@nestjs/common';
import { decideOwnershipTransfer } from '@opentask/contracts/workspaces/permissions';
import type { Workspace } from '@opentask/contracts/workspaces/workspace';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { MemberNotFoundError } from '../errors/workspace.errors';
import { assertAllowed, assertIsMember } from '../helpers/access.helper';
import { toMemberWorkspaceDto } from '../mappers/workspace.mapper';
import { AuditLogRepository } from '../repository/audit-log.repository';
import { MembershipRepository } from '../repository/membership.repository';
import { WorkspaceRepository } from '../repository/workspace.repository';

@Injectable()
export class TransferOwnershipUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, newOwnerId: string): Promise<Workspace> {
    const workspace = await this.prisma.transaction(async () => {
      const [actor, target] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.memberships.find(workspaceId, newOwnerId),
      ]);
      const member = assertIsMember(actor);
      if (!target) throw new MemberNotFoundError();
      assertAllowed(decideOwnershipTransfer(member, target));
      await this.memberships.updateRole(workspaceId, newOwnerId, 'owner');
      await this.memberships.updateRole(workspaceId, actorId, 'admin');
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'workspace.ownership_transferred',
        targetType: 'member',
        targetId: newOwnerId,
        metadata: { previousOwnerId: actorId },
      });
      return toMemberWorkspaceDto(
        assertIsMember(await this.workspaces.findForMember(workspaceId, actorId)),
      );
    });
    this.realtime.control(workspaceId, {
      type: 'membership.role_changed',
      userId: newOwnerId,
      role: 'owner',
    });
    this.realtime.control(workspaceId, {
      type: 'membership.role_changed',
      userId: actorId,
      role: 'admin',
    });
    this.realtime.publish(workspaceId, { type: 'members.changed' }, EVERYONE);
    return workspace;
  }
}
