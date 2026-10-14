import { Inject, Injectable } from '@nestjs/common';
import type { AcceptInvitationResult } from '@opentask/contracts/invitations/invitation';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { hashToken } from '../../../shared/utils/secret-token';
import { UserRepository } from '../../users/repository/user.repository';
import { AuditLogRepository } from '../../workspaces/repository/audit-log.repository';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import {
  InvitationInvalidError,
  InvitationRecipientMismatchError,
} from '../errors/invitation.errors';
import { invitationStatus, normalizeEmail } from '../helpers/invitation.helper';
import { InvitationRepository } from '../repository/invitation.repository';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(InvitationRepository) private readonly invitations: InvitationRepository,
    @Inject(UserRepository) private readonly users: UserRepository,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, token: string): Promise<AcceptInvitationResult> {
    const now = new Date();
    const result = await this.prisma.transaction(async () => {
      const [invitation, user] = await Promise.all([
        this.invitations.findByTokenHash(hashToken(token)),
        this.users.findById(actorId),
      ]);
      if (!invitation || invitationStatus(invitation, now) !== 'pending')
        throw new InvitationInvalidError();
      if (!user || normalizeEmail(user.email) !== invitation.email)
        throw new InvitationRecipientMismatchError();

      const workspaceId = invitation.workspaceId;
      if (await this.memberships.find(workspaceId, actorId)) {
        await this.invitations.markAccepted(invitation.id, actorId, now);
        return { workspaceId };
      }
      if (!(await this.invitations.markAccepted(invitation.id, actorId, now)))
        throw new InvitationInvalidError();
      await this.memberships.add({ workspaceId, userId: actorId, role: invitation.role });
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'member.joined',
        targetType: 'member',
        targetId: actorId,
        metadata: { role: invitation.role, invitationId: invitation.id },
      });
      return { workspaceId };
    });
    this.realtime.publish(result.workspaceId, { type: 'members.changed' }, EVERYONE);
    return result;
  }
}
