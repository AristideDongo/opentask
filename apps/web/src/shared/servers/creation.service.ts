import type { Channel, CreateChannelInput } from '@opentask/contracts/channels/channel';
import type { CreateProjectInput, Project } from '@opentask/contracts/projects/project';
import type { CreateTeamInput, Team } from '@opentask/contracts/teams/team';
import { apiClient } from '../utils/api-client';

export const createProject = (workspaceId: string, input: CreateProjectInput) =>
  apiClient<Project>(`/workspaces/${workspaceId}/projects`, { method: 'POST', body: input });

export const createChannel = (workspaceId: string, input: CreateChannelInput) =>
  apiClient<Channel>(`/workspaces/${workspaceId}/channels`, { method: 'POST', body: input });

export const createTeam = (workspaceId: string, input: CreateTeamInput) =>
  apiClient<Team>(`/workspaces/${workspaceId}/teams`, { method: 'POST', body: input });
