import { Inject, Injectable } from '@nestjs/common';
import type { CreatedInvitation } from '@opentask/contracts/invitations/invitation';
import { decideInvitation } from '@opentask/contracts/workspaces/permissions';
import type { AssignableRole } from '@opentask/contracts/workspaces/roles';
import { MailService } from '../../../infrastructures/mail/mail.service';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { ENV, type Env } from '../../../shared/config/env';
import { generateSecretToken, hashToken } from '../../../shared/utils/secret-token';
import { AlreadyMemberError } from '../../workspaces/errors/workspace.errors';
import { assertAllowed, assertIsMember } from '../../workspaces/helpers/access.helper';
import { AuditLogRepository } from '../../workspaces/repository/audit-log.repository';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { WorkspaceRepository } from '../../workspaces/repository/workspace.repository';
import { invitationExpiry, inviteUrl, normalizeEmail } from '../helpers/invitation.helper';
import { toInvitationDto } from '../mappers/invitation.mapper';
import { InvitationRepository } from '../repository/invitation.repository';

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(InvitationRepository) private readonly invitations: InvitationRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(MailService) private readonly mail: MailService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    input: { email: string; role: AssignableRole },
  ): Promise<CreatedInvitation> {
    const email = normalizeEmail(input.email);
    const token = generateSecretToken();
    const now = new Date();

    const { invitation, workspaceName, inviterName } = await this.prisma.transaction(async () => {
      const [actor, alreadyMember] = await Promise.all([
        this.workspaces.findForMember(workspaceId, actorId),
        this.memberships.existsByEmail(workspaceId, email),
      ]);
      const member = assertIsMember(actor);
      assertAllowed(decideInvitation(member.role, input.role));
      if (alreadyMember) throw new AlreadyMemberError();
      await this.invitations.revokeOpenForEmail(workspaceId, email, now);
      const created = await this.invitations.create({
        workspaceId,
        email,
        role: input.role,
        tokenHash: hashToken(token),
        invitedById: actorId,
        expiresAt: invitationExpiry(now),
      });
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'invitation.created',
        targetType: 'invitation',
        targetId: created.id,
        metadata: { email, role: input.role },
      });
      return {
        invitation: created,
        workspaceName: member.workspace.name,
        inviterName: created.invitedBy?.name ?? '',
      };
    });

    const url = inviteUrl(this.env.PUBLIC_URL, token);
    this.mail.enqueueInvitation({ to: email, workspaceName, inviterName, inviteUrl: url });
    return { ...toInvitationDto(invitation, 'pending'), inviteUrl: url };
  }
}
