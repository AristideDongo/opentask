import type { CreateTaskInput, Task, UpdateTaskInput } from '@opentask/contracts/tasks/task';
import { apiClient } from '../utils/api-client';

export const createTask = (workspaceId: string, projectId: string, input: CreateTaskInput) =>
  apiClient<Task>(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, {
    method: 'POST',
    body: input,
  });

export const updateTask = (workspaceId: string, taskId: string, input: UpdateTaskInput) =>
  apiClient<Task>(`/workspaces/${workspaceId}/tasks/${taskId}`, { method: 'PATCH', body: input });
