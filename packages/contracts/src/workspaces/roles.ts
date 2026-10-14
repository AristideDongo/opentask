import { z } from 'zod';

export const WORKSPACE_ROLES = ['owner', 'admin', 'member', 'guest'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];
export const WorkspaceRoleSchema = z.enum(WORKSPACE_ROLES);

export const ASSIGNABLE_ROLES = ['admin', 'member', 'guest'] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
export const AssignableRoleSchema = z.enum(ASSIGNABLE_ROLES);

const RANK: Record<WorkspaceRole, number> = { owner: 3, admin: 2, member: 1, guest: 0 };

export const isAtLeast = (role: WorkspaceRole, minimum: WorkspaceRole): boolean =>
  RANK[role] >= RANK[minimum];
