import { type AssignableRole, type WorkspaceRole, isAtLeast } from './roles';

export type WorkspaceAction =
  | 'workspace.read'
  | 'workspace.update'
  | 'workspace.delete'
  | 'workspace.transferOwnership'
  | 'member.list'
  | 'member.invite'
  | 'invitation.manage'
  | 'audit.read'
  | 'team.manage'
  | 'project.create'
  | 'project.update'
  | 'project.delete'
  | 'task.read'
  | 'task.write'
  | 'task.comment'
  | 'channel.create'
  | 'channel.readPublic';

const MINIMUM_ROLE: Record<WorkspaceAction, WorkspaceRole> = {
  'workspace.read': 'guest',
  'workspace.update': 'admin',
  'workspace.delete': 'owner',
  'workspace.transferOwnership': 'owner',
  'member.list': 'guest',
  'member.invite': 'admin',
  'invitation.manage': 'admin',
  'audit.read': 'admin',
  'team.manage': 'admin',
  'project.create': 'member',
  'project.update': 'member',
  'project.delete': 'admin',
  'task.read': 'guest',
  'task.write': 'member',
  'task.comment': 'guest',
  'channel.create': 'member',
  'channel.readPublic': 'member',
};

export const can = (role: WorkspaceRole, action: WorkspaceAction): boolean =>
  isAtLeast(role, MINIMUM_ROLE[action]);

export type DenialReason =
  | 'insufficient_role'
  | 'owner_role_locked'
  | 'own_role'
  | 'owner_must_transfer'
  | 'already_owner'
  | 'guest_cannot_own'
  | 'admin_grant_reserved'
  | 'not_task_author';

export type Decision = { allowed: true } | { allowed: false; reason: DenialReason };

const allow: Decision = { allowed: true };
const deny = (reason: DenialReason): Decision => ({ allowed: false, reason });

export interface MemberRef {
  userId: string;
  role: WorkspaceRole;
}

export const canGrantRole = (actorRole: WorkspaceRole, role: AssignableRole): boolean =>
  actorRole === 'owner' || (actorRole === 'admin' && (role === 'member' || role === 'guest'));

export function decideInvitation(actorRole: WorkspaceRole, role: AssignableRole): Decision {
  if (!can(actorRole, 'member.invite')) return deny('insufficient_role');
  return canGrantRole(actorRole, role) ? allow : deny('admin_grant_reserved');
}

export function decideRoleChange(
  actor: MemberRef,
  target: MemberRef,
  newRole: AssignableRole,
): Decision {
  if (target.role === 'owner') return deny('owner_role_locked');
  if (actor.userId === target.userId) return deny('own_role');
  if (actor.role === 'owner') return allow;
  if (actor.role === 'admin' && target.role !== 'admin' && canGrantRole('admin', newRole))
    return allow;
  return deny('insufficient_role');
}

export function decideMemberRemoval(actor: MemberRef, target: MemberRef): Decision {
  if (target.role === 'owner') return deny('owner_must_transfer');
  if (actor.userId === target.userId || actor.role === 'owner') return allow;
  if (actor.role === 'admin' && (target.role === 'member' || target.role === 'guest')) return allow;
  return deny('insufficient_role');
}

export function decideOwnershipTransfer(actor: MemberRef, target: MemberRef): Decision {
  if (!can(actor.role, 'workspace.transferOwnership')) return deny('insufficient_role');
  if (actor.userId === target.userId) return deny('already_owner');
  if (target.role === 'guest') return deny('guest_cannot_own');
  return allow;
}

export function decideTaskDeletion(
  actor: MemberRef,
  task: { createdById: string | null },
): Decision {
  if (!can(actor.role, 'task.write')) return deny('insufficient_role');
  if (task.createdById !== actor.userId && !isAtLeast(actor.role, 'admin'))
    return deny('not_task_author');
  return allow;
}
