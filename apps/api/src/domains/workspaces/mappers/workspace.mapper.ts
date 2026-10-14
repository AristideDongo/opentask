import { type Workspace, WorkspaceSchema } from '@opentask/contracts/workspaces/workspace';
import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import type { Workspace as WorkspaceRow } from '@opentask/database/client';

interface MemberWorkspaceRow {
  role: WorkspaceRole;
  workspace: WorkspaceRow & { _count: { members: number } };
}

export const toWorkspaceDto = (
  row: WorkspaceRow,
  role: WorkspaceRole,
  memberCount: number,
): Workspace =>
  WorkspaceSchema.parse({
    id: row.id,
    name: row.name,
    myRole: role,
    memberCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });

export const toMemberWorkspaceDto = ({ role, workspace }: MemberWorkspaceRow): Workspace =>
  toWorkspaceDto(workspace, role, workspace._count.members);
