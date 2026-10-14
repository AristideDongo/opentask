import {
  type Decision,
  type WorkspaceAction,
  can,
} from '@opentask/contracts/workspaces/permissions';
import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import {
  ForbiddenActionError,
  NotWorkspaceMemberError,
  WorkspaceNotFoundError,
} from '../errors/workspace.errors';
import type { Membership } from '../types/workspace.types';

export function assertIsMember<T extends Membership>(membership: T | null): T {
  if (!membership) throw new WorkspaceNotFoundError();
  return membership;
}

export function assertCan(role: WorkspaceRole, action: WorkspaceAction): void {
  if (!can(role, action)) throw new ForbiddenActionError();
}

export function assertAllowed(decision: Decision): void {
  if (!decision.allowed) throw new ForbiddenActionError(decision.reason);
}

export function assertAllMembers(requestedIds: string[], memberIds: string[]): void {
  const members = new Set(memberIds);
  if (requestedIds.some((id) => !members.has(id))) throw new NotWorkspaceMemberError();
}
