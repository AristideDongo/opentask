import { Inject, Injectable } from '@nestjs/common';
import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';

const memberInclude = {
  user: { select: { id: true, name: true, email: true, image: true } },
} as const;

@Injectable()
export class MembershipRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  find(workspaceId: string, userId: string) {
    return this.prisma.db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }

  findWithUser(workspaceId: string, userId: string) {
    return this.prisma.db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      include: memberInclude,
    });
  }

  existsByEmail(workspaceId: string, email: string) {
    return this.prisma.db.workspaceMember
      .count({ where: { workspaceId, user: { email: { equals: email, mode: 'insensitive' } } } })
      .then((count) => count > 0);
  }

  list(workspaceId: string) {
    return this.prisma.db.workspaceMember.findMany({
      where: { workspaceId },
      include: memberInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async memberIdsAmong(workspaceId: string, userIds: string[]) {
    if (userIds.length === 0) return [];
    const rows = await this.prisma.db.workspaceMember.findMany({
      where: { workspaceId, userId: { in: userIds } },
      select: { userId: true },
    });
    return rows.map((r) => r.userId);
  }

  add(data: { workspaceId: string; userId: string; role: WorkspaceRole }) {
    return this.prisma.db.workspaceMember.create({ data });
  }

  async updateRole(workspaceId: string, userId: string, role: WorkspaceRole) {
    await this.prisma.db.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role },
    });
  }

  async remove(workspaceId: string, userId: string) {
    await this.prisma.transaction(async () => {
      await this.prisma.db.task.updateMany({
        where: { workspaceId, assigneeId: userId },
        data: { assigneeId: null },
      });
      await this.prisma.db.workspaceMember.delete({
        where: { workspaceId_userId: { workspaceId, userId } },
      });
    });
  }
}
