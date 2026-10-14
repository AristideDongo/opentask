import type { Team } from '@opentask/contracts/teams/team';
import type { TeamVM } from '../types/team.types';
import { toPersonVM } from './person.mapper';

export const toTeamVM = (t: Team): TeamVM => ({
  id: t.id,
  name: t.name,
  description: t.description,
  members: t.members.map(toPersonVM),
  projectCount: t.projectCount,
});
