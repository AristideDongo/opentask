import type { AuditLogPage } from '@opentask/contracts/audit/audit-log';
import type { UpdateWorkspaceInput, Workspace } from '@opentask/contracts/workspaces/workspace';
import { apiClient, nullOn } from '../../../shared/utils/api-client';
import { AUDIT_PAGE_SIZE } from '../workspace-settings.const';

export function fetchAuditPage(workspaceId: string, cursor?: string) {
  const query = new URLSearchParams({ limit: String(AUDIT_PAGE_SIZE) });
  if (cursor) query.set('cursor', cursor);
  return apiClient<AuditLogPage>(`/workspaces/${workspaceId}/audit-logs?${query}`);
}

export const fetchFirstAuditPage = (workspaceId: string) =>
  nullOn(403, fetchAuditPage(workspaceId));

export const updateWorkspace = (workspaceId: string, input: UpdateWorkspaceInput) =>
  apiClient<Workspace>(`/workspaces/${workspaceId}`, { method: 'PATCH', body: input });

export const transferOwnership = (workspaceId: string, userId: string) =>
  apiClient<void>(`/workspaces/${workspaceId}/transfer-ownership`, {
    method: 'POST',
    body: { userId },
  });

export const leaveWorkspace = (workspaceId: string, userId: string) =>
  apiClient<void>(`/workspaces/${workspaceId}/members/${userId}`, { method: 'DELETE' });

export const deleteWorkspace = (workspaceId: string, confirmName: string) =>
  apiClient<void>(`/workspaces/${workspaceId}`, { method: 'DELETE', body: { confirmName } });
