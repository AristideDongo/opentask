import type { AuditLogEntry } from '@opentask/contracts/audit/audit-log';
import type { Invitation } from '@opentask/contracts/invitations/invitation';
import type { Member } from '@opentask/contracts/members/member';
import {
  ASSIGNABLE_ROLES,
  WORKSPACE_ROLES,
  type WorkspaceRole,
} from '@opentask/contracts/workspaces/roles';
import {
  can,
  canGrantRole,
  decideMemberRemoval,
  decideRoleChange,
} from '@opentask/contracts/workspaces/permissions';
import type { Workspace } from '@opentask/contracts/workspaces/workspace';
import type { AuditEntryVM, InvitationVM, MemberVM, WorkspaceVM } from '../types/workspace.types';
import { initialsOf } from '../utils/initials';

export const toWorkspaceVM = (w: Workspace): WorkspaceVM => ({
  id: w.id,
  name: w.name,
  role: w.myRole,
  memberCount: w.memberCount,
  permissions: {
    canUpdate: can(w.myRole, 'workspace.update'),
    canDelete: can(w.myRole, 'workspace.delete'),
    canTransferOwnership: can(w.myRole, 'workspace.transferOwnership'),
    canInvite: can(w.myRole, 'member.invite'),
    canManageInvitations: can(w.myRole, 'invitation.manage'),
    canReadAudit: can(w.myRole, 'audit.read'),
    canManageTeams: can(w.myRole, 'team.manage'),
    canCreateProject: can(w.myRole, 'project.create'),
    canUpdateProject: can(w.myRole, 'project.update'),
    canDeleteProject: can(w.myRole, 'project.delete'),
    canWriteTasks: can(w.myRole, 'task.write'),
    canCreateChannel: can(w.myRole, 'channel.create'),
    grantableRoles: ASSIGNABLE_ROLES.filter((r) => canGrantRole(w.myRole, r)),
  },
});

export function toMemberVM(
  member: Member,
  actor: { userId: string; role: WorkspaceRole },
): MemberVM {
  const target = { userId: member.userId, role: member.role };
  const roleOptions = ASSIGNABLE_ROLES.filter(
    (r) => r === member.role || decideRoleChange(actor, target, r).allowed,
  );
  return {
    id: member.userId,
    name: member.name,
    initials: initialsOf(member.name),
    email: member.email,
    role: member.role,
    isMe: member.userId === actor.userId,
    roleOptions,
    canChangeRole: roleOptions.some((r) => r !== member.role),
    canRemove: member.userId !== actor.userId && decideMemberRemoval(actor, target).allowed,
  };
}

export const toInvitationVM = (i: Invitation): InvitationVM => ({
  id: i.id,
  email: i.email,
  role: i.role,
  status: i.status,
  invitedByName: i.invitedBy?.name ?? null,
  expiresAt: i.expiresAt,
});

const asRole = (value: unknown): WorkspaceRole | null =>
  typeof value === 'string' && (WORKSPACE_ROLES as readonly string[]).includes(value)
    ? (value as WorkspaceRole)
    : null;

export const toAuditEntryVM = (entry: AuditLogEntry): AuditEntryVM => ({
  id: entry.id,
  action: entry.action,
  actorName: entry.actor?.name ?? null,
  email: typeof entry.metadata.email === 'string' ? entry.metadata.email : '',
  fromRole: asRole(entry.metadata.from),
  toRole: asRole(entry.metadata.to),
  createdAt: entry.createdAt,
});
