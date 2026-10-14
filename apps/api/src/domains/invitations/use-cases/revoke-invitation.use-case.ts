import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { AuditLogRepository } from '../../workspaces/repository/audit-log.repository';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { InvitationNotFoundError, InvitationNotPendingError } from '../errors/invitation.errors';
import { invitationStatus } from '../helpers/invitation.helper';
import { InvitationRepository } from '../repository/invitation.repository';

@Injectable()
export class RevokeInvitationUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(InvitationRepository) private readonly invitations: InvitationRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
  ) {}

  execute(actorId: string, workspaceId: string, invitationId: string): Promise<void> {
    return this.prisma.transaction(async () => {
      const [actor, invitation] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.invitations.findById(workspaceId, invitationId),
      ]);
      assertCan(assertIsMember(actor).role, 'invitation.manage');
      if (!invitation) throw new InvitationNotFoundError();
      const now = new Date();
      if (invitationStatus(invitation, now) !== 'pending') throw new InvitationNotPendingError();
      await this.invitations.markRevoked(invitation.id, now);
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'invitation.revoked',
        targetType: 'invitation',
        targetId: invitation.id,
        metadata: { email: invitation.email },
      });
    });
  }
}
