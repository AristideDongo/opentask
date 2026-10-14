import type { AuditLogPage } from '@opentask/contracts/audit/audit-log';
import type { MyTaskList } from '@opentask/contracts/tasks/task';
import { apiClient, nullOn } from '../../../shared/utils/api-client';

export const fetchMyTasks = (workspaceId: string) =>
  apiClient<MyTaskList>(`/workspaces/${workspaceId}/my-tasks`);

export const fetchRecentActivity = (workspaceId: string) =>
  nullOn(403, apiClient<AuditLogPage>(`/workspaces/${workspaceId}/audit-logs?limit=6`));
