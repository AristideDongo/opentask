import type { Team, UpdateTeamInput } from '@opentask/contracts/teams/team';
import { apiClient } from '../../../shared/utils/api-client';

const teamPath = (workspaceId: string, teamId: string) =>
  `/workspaces/${workspaceId}/teams/${teamId}`;

export const fetchTeam = (workspaceId: string, teamId: string) =>
  apiClient<Team>(teamPath(workspaceId, teamId));

export const updateTeam = (workspaceId: string, teamId: string, input: UpdateTeamInput) =>
  apiClient<Team>(teamPath(workspaceId, teamId), { method: 'PATCH', body: input });

export const deleteTeam = (workspaceId: string, teamId: string) =>
  apiClient<void>(teamPath(workspaceId, teamId), { method: 'DELETE' });

export const addTeamMember = (workspaceId: string, teamId: string, userId: string) =>
  apiClient<void>(`${teamPath(workspaceId, teamId)}/members/${userId}`, { method: 'PUT' });

export const removeTeamMember = (workspaceId: string, teamId: string, userId: string) =>
  apiClient<void>(`${teamPath(workspaceId, teamId)}/members/${userId}`, { method: 'DELETE' });
