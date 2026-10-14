import { Module } from '@nestjs/common';
import { UsersDomainModule } from '../users/users.module';
import { WorkspacesDomainModule } from '../workspaces/workspaces.module';
import { InvitationRepository } from './repository/invitation.repository';
import { AcceptInvitationUseCase } from './use-cases/accept-invitation.use-case';
import { CreateInvitationUseCase } from './use-cases/create-invitation.use-case';
import { ListInvitationsUseCase } from './use-cases/list-invitations.use-case';
import { PreviewInvitationUseCase } from './use-cases/preview-invitation.use-case';
import { RevokeInvitationUseCase } from './use-cases/revoke-invitation.use-case';

const useCases = [
  CreateInvitationUseCase,
  ListInvitationsUseCase,
  RevokeInvitationUseCase,
  PreviewInvitationUseCase,
  AcceptInvitationUseCase,
];

@Module({
  imports: [WorkspacesDomainModule, UsersDomainModule],
  providers: [InvitationRepository, ...useCases],
  exports: useCases,
})
export class InvitationsDomainModule {}
