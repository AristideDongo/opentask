import type { AuditAction } from '@opentask/contracts/audit/audit-log';
import type { InvitationStatus } from '@opentask/contracts/invitations/invitation';
import type { AssignableRole, WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import type { PersonVM } from './person.types';

export interface WorkspacePermissionsVM {
  canUpdate: boolean;
  canDelete: boolean;
  canTransferOwnership: boolean;
  canInvite: boolean;
  canManageInvitations: boolean;
  canReadAudit: boolean;
  canManageTeams: boolean;
  canCreateProject: boolean;
  canUpdateProject: boolean;
  canDeleteProject: boolean;
  canWriteTasks: boolean;
  canCreateChannel: boolean;
  grantableRoles: AssignableRole[];
}

export interface WorkspaceVM {
  id: string;
  name: string;
  role: WorkspaceRole;
  memberCount: number;
  permissions: WorkspacePermissionsVM;
}

export interface MemberVM extends PersonVM {
  email: string;
  role: WorkspaceRole;
  isMe: boolean;
  roleOptions: AssignableRole[];
  canChangeRole: boolean;
  canRemove: boolean;
}

export interface InvitationVM {
  id: string;
  email: string;
  role: AssignableRole;
  status: InvitationStatus;
  invitedByName: string | null;
  expiresAt: string;
}

export interface AuditEntryVM {
  id: string;
  action: AuditAction;
  actorName: string | null;
  email: string;
  fromRole: WorkspaceRole | null;
  toRole: WorkspaceRole | null;
  createdAt: string;
}
