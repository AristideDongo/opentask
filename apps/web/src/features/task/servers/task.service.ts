import type { Attachment } from '@opentask/contracts/attachments/attachment';
import type { TaskComment } from '@opentask/contracts/tasks/comment';
import type { TaskDetail } from '@opentask/contracts/tasks/task';
import type { Workspace } from '@opentask/contracts/workspaces/workspace';
import { apiClient, apiUpload } from '../../../shared/utils/api-client';

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

export const uploadTaskAttachment = (workspaceId: string, taskId: string, file: File) =>
  apiUpload<Attachment>(`/workspaces/${workspaceId}/tasks/${taskId}/attachments`, file);

export const deleteAttachment = (workspaceId: string, attachmentId: string) =>
  apiClient<void>(`/workspaces/${workspaceId}/attachments/${attachmentId}`, { method: 'DELETE' });
