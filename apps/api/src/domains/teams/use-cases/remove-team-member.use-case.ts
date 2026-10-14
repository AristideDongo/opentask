import { Inject, Injectable } from '@nestjs/common';
import type { Team } from '@opentask/contracts/teams/team';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { TeamNotFoundError } from '../errors/team.errors';
import { toTeamDto } from '../mappers/team.mapper';
import { TeamRepository } from '../repository/team.repository';

@Injectable()
export class RemoveTeamMemberUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TeamRepository) private readonly teams: TeamRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    teamId: string,
    userId: string,
  ): Promise<Team> {
    const result = await this.prisma.transaction(async () => {
      const [actor, team] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.teams.findById(workspaceId, teamId),
      ]);
      const member = assertIsMember(actor);
      if (!team) throw new TeamNotFoundError();
      assertCan(member.role, 'team.manage');
      await this.teams.removeMember(teamId, userId);
      const view = await this.teams.findView(workspaceId, teamId);
      if (!view) throw new TeamNotFoundError();
      return toTeamDto(view);
    });
    this.realtime.publish(workspaceId, { type: 'team.changed', teamId }, EVERYONE);
    return result;
  }
}
