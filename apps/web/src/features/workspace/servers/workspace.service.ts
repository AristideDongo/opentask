import type { ChannelList } from '@opentask/contracts/channels/channel';
import type { MemberList } from '@opentask/contracts/members/member';
import type { ProjectList } from '@opentask/contracts/projects/project';
import type { TeamList } from '@opentask/contracts/teams/team';
import type { Workspace } from '@opentask/contracts/workspaces/workspace';
import { apiClient } from '../../../shared/utils/api-client';

export async function fetchWorkspaceBundle(workspaceId: string) {
  const base = `/workspaces/${workspaceId}`;
  const [workspace, projects, channels, teams, members] = await Promise.all([
    apiClient<Workspace>(base),
    apiClient<ProjectList>(`${base}/projects`),
    apiClient<ChannelList>(`${base}/channels`),
    apiClient<TeamList>(`${base}/teams`),
    apiClient<MemberList>(`${base}/members`),
  ]);
  return {
    workspace,
    projects: projects.items,
    channels: channels.items,
    teams: teams.items,
    members: members.items,
  };
}
