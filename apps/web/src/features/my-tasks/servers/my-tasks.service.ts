import type { MyTaskList } from '@opentask/contracts/tasks/task';
import { apiClient } from '../../../shared/utils/api-client';

export const fetchMyTasks = (workspaceId: string) =>
  apiClient<MyTaskList>(`/workspaces/${workspaceId}/my-tasks`);
