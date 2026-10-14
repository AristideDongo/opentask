import type { TeamVM } from '../../../shared/types/team.types';
import type { MemberVM } from '../../../shared/types/workspace.types';
import type { TeamMemberRowVM } from '../team.types';

export function toTeamMemberRows(team: TeamVM, workspaceMembers: MemberVM[]): TeamMemberRowVM[] {
  const emails = new Map(workspaceMembers.map((m) => [m.id, m.email]));
  return team.members.map((m) => ({ ...m, email: emails.get(m.id) ?? '' }));
}

export const teamCandidates = (team: TeamVM, workspaceMembers: MemberVM[]) =>
  workspaceMembers.filter((m) => !team.members.some((x) => x.id === m.id));
