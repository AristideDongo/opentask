import type { CreateWorkspaceInput, Workspace } from '@opentask/contracts/workspaces/workspace';
import { apiClient } from '../../../shared/utils/api-client';

export const createWorkspace = (input: CreateWorkspaceInput) =>
  apiClient<Workspace>('/workspaces', { method: 'POST', body: input });
