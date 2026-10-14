import { Module } from '@nestjs/common';
import { WorkspacesDomainModule } from '../../domains/workspaces/workspaces.module';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { MembersController } from './controllers/members.controller';
import { WorkspacesController } from './controllers/workspaces.controller';

@Module({
  imports: [WorkspacesDomainModule],
  controllers: [WorkspacesController, MembersController, AuditLogsController],
})
export class WorkspacesModule {}
