import { Inject, Injectable } from '@nestjs/common';
import type { Team } from '@opentask/contracts/teams/team';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { TeamNotFoundError } from '../errors/team.errors';
import { toTeamDto } from '../mappers/team.mapper';
import { TeamRepository } from '../repository/team.repository';

@Injectable()
export class GetTeamUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TeamRepository) private readonly teams: TeamRepository,
  ) {}

  async execute(actorId: string, workspaceId: string, teamId: string): Promise<Team> {
    const [membership, team] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.teams.findView(workspaceId, teamId),
    ]);
    assertIsMember(membership);
    if (!team) throw new TeamNotFoundError();
    return toTeamDto(team);
  }
}
