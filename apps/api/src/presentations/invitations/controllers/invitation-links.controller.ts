import { Controller, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type {
  AcceptInvitationResult,
  InvitationPreview,
} from '@opentask/contracts/invitations/invitation';
import { AcceptInvitationUseCase } from '../../../domains/invitations/use-cases/accept-invitation.use-case';
import { PreviewInvitationUseCase } from '../../../domains/invitations/use-cases/preview-invitation.use-case';
import { Public } from '../../../shared/decorators/public.decorator';
import { UserId } from '../../../shared/decorators/user-id.decorator';

@Controller('invitations/:token')
@Throttle({ default: { limit: 30, ttl: 60_000 } })
export class InvitationLinksController {
  constructor(
    @Inject(PreviewInvitationUseCase) private readonly previewInvitation: PreviewInvitationUseCase,
    @Inject(AcceptInvitationUseCase) private readonly acceptInvitation: AcceptInvitationUseCase,
  ) {}

  @Get()
  @Public()
  preview(@Param('token') token: string): Promise<InvitationPreview> {
    return this.previewInvitation.execute(token);
  }

  @Post('accept')
  @HttpCode(200)
  accept(@UserId() userId: string, @Param('token') token: string): Promise<AcceptInvitationResult> {
    return this.acceptInvitation.execute(userId, token);
  }
}
