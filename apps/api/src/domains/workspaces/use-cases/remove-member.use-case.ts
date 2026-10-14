import { Inject, Injectable } from '@nestjs/common';
import { decideMemberRemoval } from '@opentask/contracts/workspaces/permissions';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { MemberNotFoundError } from '../errors/workspace.errors';
import { assertAllowed, assertIsMember } from '../helpers/access.helper';
import { AuditLogRepository } from '../repository/audit-log.repository';
import { MembershipRepository } from '../repository/membership.repository';

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, targetUserId: string): Promise<void> {
    await this.prisma.transaction(async () => {
      const [actor, target] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.memberships.find(workspaceId, targetUserId),
      ]);
      const current = assertIsMember(actor);
      if (!target) throw new MemberNotFoundError();
      assertAllowed(decideMemberRemoval(current, target));
      await this.memberships.remove(workspaceId, targetUserId);
      await this.audit.record({
        workspaceId,
        actorId,
        action: actorId === targetUserId ? 'member.left' : 'member.removed',
        targetType: 'member',
        targetId: targetUserId,
        metadata: { role: target.role },
      });
    });
    this.realtime.control(workspaceId, { type: 'membership.revoked', userId: targetUserId });
    this.realtime.publish(workspaceId, { type: 'members.changed' }, EVERYONE);
  }
}
