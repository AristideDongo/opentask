import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import type { AuditAction } from '@opentask/contracts/audit/audit-log';

export interface Membership {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}

export interface AuditEntryInput {
  workspaceId: string;
  actorId: string | null;
  action: AuditAction;
  targetType: 'workspace' | 'member' | 'invitation' | 'team' | 'project' | 'channel';
  targetId: string | null;
  metadata?: Record<string, unknown>;
}
