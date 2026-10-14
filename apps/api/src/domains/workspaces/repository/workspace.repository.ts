import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { DEFAULT_CHANNEL_NAME } from '../workspaces.const';

@Injectable()
export class WorkspaceRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  createWithOwner(data: { name: string; ownerId: string }) {
    return this.prisma.db.workspace.create({
      data: {
        name: data.name,
        members: { create: { userId: data.ownerId, role: 'owner' } },
        channels: { create: { name: DEFAULT_CHANNEL_NAME, createdById: data.ownerId } },
      },
    });
  }

  findById(id: string) {
    return this.prisma.db.workspace.findUnique({ where: { id } });
  }

  findForMember(id: string, userId: string) {
    return this.prisma.db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId } },
      include: { workspace: { include: { _count: { select: { members: true } } } } },
    });
  }

  listForUser(userId: string) {
    return this.prisma.db.workspaceMember.findMany({
      where: { userId },
      orderBy: { workspace: { name: 'asc' } },
      include: { workspace: { include: { _count: { select: { members: true } } } } },
    });
  }

  update(id: string, data: { name: string }) {
    return this.prisma.db.workspace.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.db.workspace.delete({ where: { id } });
  }
}
