import { toTeamVM } from '../../../shared/mappers/team.mapper';
import { fetchTeam } from './team.service';

export async function teamLoader({
  params,
}: {
  params: { workspaceId?: string; teamId?: string };
}) {
  return { team: toTeamVM(await fetchTeam(params.workspaceId ?? '', params.teamId ?? '')) };
}
