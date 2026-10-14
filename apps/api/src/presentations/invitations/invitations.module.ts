import { Module } from '@nestjs/common';
import { InvitationsDomainModule } from '../../domains/invitations/invitations.module';
import { InvitationLinksController } from './controllers/invitation-links.controller';
import { WorkspaceInvitationsController } from './controllers/workspace-invitations.controller';

@Module({
  imports: [InvitationsDomainModule],
  controllers: [WorkspaceInvitationsController, InvitationLinksController],
})
export class InvitationsModule {}
