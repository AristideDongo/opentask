import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { AuditLogRepository } from '../../workspaces/repository/audit-log.repository';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { TeamNotFoundError } from '../errors/team.errors';
import { TeamRepository } from '../repository/team.repository';

@Injectable()
export class DeleteTeamUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TeamRepository) private readonly teams: TeamRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, teamId: string): Promise<void> {
    const result = await this.prisma.transaction(async () => {
      const [actor, team] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.teams.findById(workspaceId, teamId),
      ]);
      const member = assertIsMember(actor);
      if (!team) throw new TeamNotFoundError();
      assertCan(member.role, 'team.manage');
      await this.teams.delete(teamId);
      await this.audit.record({
        workspaceId,
        actorId,
        action: 'team.deleted',
        targetType: 'team',
        targetId: teamId,
        metadata: { name: team.name },
      });
    });
    this.realtime.publish(workspaceId, { type: 'team.changed', teamId }, EVERYONE);
    return result;
  }
}
