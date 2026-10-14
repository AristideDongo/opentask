import { Inject, Injectable } from '@nestjs/common';
import type { Member } from '@opentask/contracts/members/member';
import { decideRoleChange } from '@opentask/contracts/workspaces/permissions';
import type { AssignableRole } from '@opentask/contracts/workspaces/roles';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { MemberNotFoundError } from '../errors/workspace.errors';
import { assertAllowed, assertIsMember } from '../helpers/access.helper';
import { toMemberDto } from '../mappers/member.mapper';
import { AuditLogRepository } from '../repository/audit-log.repository';
import { MembershipRepository } from '../repository/membership.repository';

@Injectable()
export class ChangeMemberRoleUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    targetUserId: string,
    role: AssignableRole,
  ): Promise<Member> {
    const member = await this.prisma.transaction(async () => {
      const [actor, target] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.memberships.find(workspaceId, targetUserId),
      ]);
      const current = assertIsMember(actor);
      if (!target) throw new MemberNotFoundError();
      assertAllowed(decideRoleChange(current, target, role));
      if (target.role !== role) {
        await this.memberships.updateRole(workspaceId, targetUserId, role);
        await this.audit.record({
          workspaceId,
          actorId,
          action: 'member.role_changed',
          targetType: 'member',
          targetId: targetUserId,
          metadata: { from: target.role, to: role },
        });
      }
      const updated = await this.memberships.findWithUser(workspaceId, targetUserId);
      if (!updated) throw new MemberNotFoundError();
      return toMemberDto(updated);
    });
    this.realtime.control(workspaceId, {
      type: 'membership.role_changed',
      userId: targetUserId,
      role,
    });
    this.realtime.publish(workspaceId, { type: 'members.changed' }, EVERYONE);
    return member;
  }
}
