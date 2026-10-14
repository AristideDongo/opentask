import { toChannelVM } from '../../../shared/mappers/channel.mapper';
import { toProjectVM } from '../../../shared/mappers/project.mapper';
import { toTeamVM } from '../../../shared/mappers/team.mapper';
import { toMemberVM, toWorkspaceVM } from '../../../shared/mappers/workspace.mapper';
import { fetchMe } from '../../../shared/servers/session.service';
import type { WorkspaceData } from '../../../shared/types/route-data.types';
import { rememberWorkspace } from '../../../shared/utils/last-workspace';
import { fetchWorkspaceBundle } from './workspace.service';

export async function workspaceLoader({
  params,
}: {
  params: { workspaceId?: string };
}): Promise<WorkspaceData> {
  const [bundle, me] = await Promise.all([
    fetchWorkspaceBundle(params.workspaceId ?? ''),
    fetchMe(),
  ]);
  rememberWorkspace(bundle.workspace.id);
  const actor = { userId: me?.id ?? '', role: bundle.workspace.myRole };
  return {
    workspace: toWorkspaceVM(bundle.workspace),
    projects: bundle.projects.map(toProjectVM),
    channels: bundle.channels.map(toChannelVM),
    teams: bundle.teams.map(toTeamVM),
    members: bundle.members.map((m) => toMemberVM(m, actor)),
  };
}
