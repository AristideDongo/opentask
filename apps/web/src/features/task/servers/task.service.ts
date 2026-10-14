import type { TaskComment } from '@opentask/contracts/tasks/comment';
import type { TaskDetail } from '@opentask/contracts/tasks/task';
import type { Workspace } from '@opentask/contracts/workspaces/workspace';
import { apiClient } from '../../../shared/utils/api-client';

export const fetchTaskDetail = (workspaceId: string, taskId: string) =>
  apiClient<TaskDetail>(`/workspaces/${workspaceId}/tasks/${taskId}`);

export const fetchWorkspace = (workspaceId: string) =>
  apiClient<Workspace>(`/workspaces/${workspaceId}`);

export const deleteTask = (workspaceId: string, taskId: string) =>
  apiClient<void>(`/workspaces/${workspaceId}/tasks/${taskId}`, { method: 'DELETE' });

export const commentTask = (workspaceId: string, taskId: string, body: string) =>
  apiClient<TaskComment>(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, {
    method: 'POST',
    body: { body },
  });
