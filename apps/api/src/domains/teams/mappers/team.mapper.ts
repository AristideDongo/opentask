import { type Team, TeamSchema } from '@opentask/contracts/teams/team';
import type { Prisma } from '@opentask/database/client';
import type { teamInclude } from '../repository/team.repository';

export const toTeamDto = (row: Prisma.TeamGetPayload<{ include: typeof teamInclude }>): Team =>
  TeamSchema.parse({
    id: row.id,
    name: row.name,
    description: row.description,
    members: row.members.map((m) => m.membership.user),
    projectCount: row._count.projects,
    createdAt: row.createdAt.toISOString(),
  });
