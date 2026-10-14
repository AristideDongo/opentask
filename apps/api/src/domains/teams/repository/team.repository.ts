import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { Prisma } from '@opentask/database/client';
import { TeamNameTakenError } from '../errors/team.errors';

const UNIQUE_VIOLATION_CODE = 'P2002';

export const teamInclude = {
  members: {
    include: { membership: { include: { user: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: 'asc' },
  },
  _count: { select: { projects: true } },
} as const satisfies Prisma.TeamInclude;

async function withUniqueNameMapped<T>(write: Promise<T>): Promise<T> {
  try {
    return await write;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_VIOLATION_CODE
    ) {
      throw new TeamNameTakenError();
    }
    throw error;
  }
}

@Injectable()
export class TeamRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: { workspaceId: string; name: string; description: string; memberIds: string[] }) {
    return withUniqueNameMapped(
      this.prisma.db.team.create({
        data: {
          workspaceId: data.workspaceId,
          name: data.name,
          description: data.description,
          members: {
            create: data.memberIds.map((userId) => ({ workspaceId: data.workspaceId, userId })),
          },
        },
      }),
    );
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.db.team.findFirst({ where: { id, workspaceId } });
  }

  list(workspaceId: string) {
    return this.prisma.db.team.findMany({
      where: { workspaceId },
      include: teamInclude,
      orderBy: { name: 'asc' },
    });
  }

  findView(workspaceId: string, id: string) {
    return this.prisma.db.team.findFirst({ where: { id, workspaceId }, include: teamInclude });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    await withUniqueNameMapped(this.prisma.db.team.update({ where: { id }, data }));
  }

  async delete(id: string) {
    await this.prisma.db.team.delete({ where: { id } });
  }

  async addMember(workspaceId: string, teamId: string, userId: string) {
    await this.prisma.db.teamMember.createMany({
      data: [{ teamId, workspaceId, userId }],
      skipDuplicates: true,
    });
  }

  async removeMember(teamId: string, userId: string) {
    await this.prisma.db.teamMember.deleteMany({ where: { teamId, userId } });
  }
}
