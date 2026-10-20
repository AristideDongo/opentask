import { Module } from '@nestjs/common';
import { AttachmentRepository } from '../attachments/repository/attachment.repository';
import { AuditLogRepository } from './repository/audit-log.repository';
import { MembershipRepository } from './repository/membership.repository';
import { WorkspaceRepository } from './repository/workspace.repository';
import { ChangeMemberRoleUseCase } from './use-cases/change-member-role.use-case';
import { CreateWorkspaceUseCase } from './use-cases/create-workspace.use-case';
import { DeleteWorkspaceUseCase } from './use-cases/delete-workspace.use-case';
import { GetWorkspaceUseCase } from './use-cases/get-workspace.use-case';
import { ListAuditLogsUseCase } from './use-cases/list-audit-logs.use-case';
import { ListMembersUseCase } from './use-cases/list-members.use-case';
import { ListWorkspacesUseCase } from './use-cases/list-workspaces.use-case';
import { RemoveMemberUseCase } from './use-cases/remove-member.use-case';
import { TransferOwnershipUseCase } from './use-cases/transfer-ownership.use-case';
import { UpdateWorkspaceUseCase } from './use-cases/update-workspace.use-case';

const useCases = [
  CreateWorkspaceUseCase,
  ListWorkspacesUseCase,
  GetWorkspaceUseCase,
  UpdateWorkspaceUseCase,
  DeleteWorkspaceUseCase,
  TransferOwnershipUseCase,
  ListMembersUseCase,
  ChangeMemberRoleUseCase,
  RemoveMemberUseCase,
  ListAuditLogsUseCase,
];

@Module({
  providers: [
    WorkspaceRepository,
    AttachmentRepository,
    MembershipRepository,
    AuditLogRepository,
    ...useCases,
  ],
  exports: [WorkspaceRepository, MembershipRepository, AuditLogRepository, ...useCases],
})
export class WorkspacesDomainModule {}
