import type {
  Column,
  CreateColumnInput,
  DeleteColumnInput,
  UpdateColumnInput,
} from '@opentask/contracts/projects/column';
import type { CreateLabelInput, Label, UpdateLabelInput } from '@opentask/contracts/projects/label';
import type { Project, UpdateProjectInput } from '@opentask/contracts/projects/project';
import type { TaskList } from '@opentask/contracts/tasks/task';
import { apiClient } from '../../../shared/utils/api-client';

const projectPath = (workspaceId: string, projectId: string) =>
  `/workspaces/${workspaceId}/projects/${projectId}`;

export const fetchProject = (workspaceId: string, projectId: string) =>
  apiClient<Project>(projectPath(workspaceId, projectId));

export const fetchProjectTasks = (workspaceId: string, projectId: string, query: URLSearchParams) =>
  apiClient<TaskList>(`${projectPath(workspaceId, projectId)}/tasks?${query}`);

export const updateProject = (workspaceId: string, projectId: string, input: UpdateProjectInput) =>
  apiClient<Project>(projectPath(workspaceId, projectId), { method: 'PATCH', body: input });

export const deleteProject = (workspaceId: string, projectId: string) =>
  apiClient<void>(projectPath(workspaceId, projectId), { method: 'DELETE' });

export const createColumn = (workspaceId: string, projectId: string, input: CreateColumnInput) =>
  apiClient<Column>(`${projectPath(workspaceId, projectId)}/columns`, {
    method: 'POST',
    body: input,
  });

export const updateColumn = (
  workspaceId: string,
  projectId: string,
  columnId: string,
  input: UpdateColumnInput,
) =>
  apiClient<Column>(`${projectPath(workspaceId, projectId)}/columns/${columnId}`, {
    method: 'PATCH',
    body: input,
  });

export const deleteColumn = (
  workspaceId: string,
  projectId: string,
  columnId: string,
  input: DeleteColumnInput,
) =>
  apiClient<void>(`${projectPath(workspaceId, projectId)}/columns/${columnId}`, {
    method: 'DELETE',
    body: input,
  });

export const createLabel = (workspaceId: string, projectId: string, input: CreateLabelInput) =>
  apiClient<Label>(`${projectPath(workspaceId, projectId)}/labels`, {
    method: 'POST',
    body: input,
  });

export const updateLabel = (
  workspaceId: string,
  projectId: string,
  labelId: string,
  input: UpdateLabelInput,
) =>
  apiClient<Label>(`${projectPath(workspaceId, projectId)}/labels/${labelId}`, {
    method: 'PATCH',
    body: input,
  });

export const deleteLabel = (workspaceId: string, projectId: string, labelId: string) =>
  apiClient<void>(`${projectPath(workspaceId, projectId)}/labels/${labelId}`, { method: 'DELETE' });
