import { Inject, Injectable } from '@nestjs/common';
import type { InvitationPreview } from '@opentask/contracts/invitations/invitation';
import { hashToken } from '../../../shared/utils/secret-token';
import { InvitationInvalidError } from '../errors/invitation.errors';
import { invitationStatus } from '../helpers/invitation.helper';
import { toInvitationPreviewDto } from '../mappers/invitation.mapper';
import { InvitationRepository } from '../repository/invitation.repository';

@Injectable()
export class PreviewInvitationUseCase {
  constructor(@Inject(InvitationRepository) private readonly invitations: InvitationRepository) {}

  async execute(token: string): Promise<InvitationPreview> {
    const invitation = await this.invitations.findByTokenHash(hashToken(token));
    if (!invitation) throw new InvitationInvalidError();
    return toInvitationPreviewDto(invitation, invitationStatus(invitation, new Date()));
  }
}
