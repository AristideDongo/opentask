import { Inject, Injectable } from '@nestjs/common';
import type { Team } from '@opentask/contracts/teams/team';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { toTeamDto } from '../mappers/team.mapper';
import { TeamRepository } from '../repository/team.repository';

@Injectable()
export class ListTeamsUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TeamRepository) private readonly teams: TeamRepository,
  ) {}

  async execute(actorId: string, workspaceId: string): Promise<Team[]> {
    const [membership, teams] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.teams.list(workspaceId),
    ]);
    assertIsMember(membership);
    return teams.map(toTeamDto);
  }
}
