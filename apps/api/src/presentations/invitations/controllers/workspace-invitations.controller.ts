import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  type CreatedInvitation,
  CreateInvitationInputSchema,
  type InvitationList,
} from '@opentask/contracts/invitations/invitation';
import type { z } from 'zod';
import { CreateInvitationUseCase } from '../../../domains/invitations/use-cases/create-invitation.use-case';
import { ListInvitationsUseCase } from '../../../domains/invitations/use-cases/list-invitations.use-case';
import { RevokeInvitationUseCase } from '../../../domains/invitations/use-cases/revoke-invitation.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/invitations')
export class WorkspaceInvitationsController {
  constructor(
    @Inject(ListInvitationsUseCase) private readonly listInvitations: ListInvitationsUseCase,
    @Inject(CreateInvitationUseCase) private readonly createInvitation: CreateInvitationUseCase,
    @Inject(RevokeInvitationUseCase) private readonly revokeInvitation: RevokeInvitationUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<InvitationList> {
    return { items: await this.listInvitations.execute(userId, workspaceId) };
  }

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  create(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodPipe(CreateInvitationInputSchema))
    input: z.output<typeof CreateInvitationInputSchema>,
  ): Promise<CreatedInvitation> {
    return this.createInvitation.execute(userId, workspaceId, input);
  }

  @Delete(':invitationId')
  @HttpCode(204)
  async revoke(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    await this.revokeInvitation.execute(userId, workspaceId, invitationId);
  }
}
