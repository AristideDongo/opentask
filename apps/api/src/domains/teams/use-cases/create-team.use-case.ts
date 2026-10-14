import { Inject, Injectable } from '@nestjs/common';
import type { Team } from '@opentask/contracts/teams/team';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import {
  assertAllMembers,
  assertCan,
  assertIsMember,
} from '../../workspaces/helpers/access.helper';
import { AuditLogRepository } from '../../workspaces/repository/audit-log.repository';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { TeamNotFoundError } from '../errors/team.errors';
import { toTeamDto } from '../mappers/team.mapper';
import { TeamRepository } from '../repository/team.repository';

@Injectable()
export class CreateTeamUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TeamRepository) private readonly teams: TeamRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    input: { name: string; description: string; memberIds: string[] },
  ): Promise<Team> {
    const memberIds = [...new Set(input.memberIds)];
    const team = await this.prisma.transaction(async () => {
      const [actor, validIds] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.memberships.memberIdsAmong(workspaceId, memberIds),
      ]);
      assertCan(assertIsMember(actor).role, 'team.manage');
      assertAllMembers(memberIds, validIds);
      const created = await this.teams.create({ workspaceId, ...input, memberIds });
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'team.created',
        targetType: 'team',
        targetId: created.id,
        metadata: { name: created.name },
      });
      const view = await this.teams.findView(workspaceId, created.id);
      if (!view) throw new TeamNotFoundError();
      return toTeamDto(view);
    });
    this.realtime.publish(workspaceId, { type: 'team.changed', teamId: team.id }, EVERYONE);
    return team;
  }
}
