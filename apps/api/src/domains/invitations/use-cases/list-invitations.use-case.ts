import { Inject, Injectable } from '@nestjs/common';
import type { Invitation } from '@opentask/contracts/invitations/invitation';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { invitationStatus } from '../helpers/invitation.helper';
import { toInvitationDto } from '../mappers/invitation.mapper';
import { InvitationRepository } from '../repository/invitation.repository';

@Injectable()
export class ListInvitationsUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(InvitationRepository) private readonly invitations: InvitationRepository,
  ) {}

  async execute(actorId: string, workspaceId: string): Promise<Invitation[]> {
    const actor = assertIsMember(await this.memberships.find(workspaceId, actorId));
    assertCan(actor.role, 'invitation.manage');
    const now = new Date();
    return (await this.invitations.listOpen(workspaceId, now)).map((i) =>
      toInvitationDto(i, invitationStatus(i, now)),
    );
  }
}
