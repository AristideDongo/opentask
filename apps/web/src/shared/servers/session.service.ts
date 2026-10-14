import type { Me } from '@opentask/contracts/me/profile';
import type { WorkspaceList } from '@opentask/contracts/workspaces/workspace';
import { ApiRequestError, apiClient } from '../utils/api-client';

export async function fetchMe(): Promise<Me | null> {
  try {
    return await apiClient<Me>('/me');
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) return null;
    throw error;
  }
}

export const fetchWorkspaces = () => apiClient<WorkspaceList>('/workspaces');

export const signOut = () => apiClient('/auth/sign-out', { method: 'POST', body: {} });
