import { Inject, Injectable } from '@nestjs/common';
import type { AssignableRole } from '@opentask/contracts/workspaces/roles';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';

const openInvitation = (now: Date) => ({
  acceptedAt: null,
  revokedAt: null,
  expiresAt: { gt: now },
});
const inviterInclude = { invitedBy: { select: { id: true, name: true } } } as const;

@Injectable()
export class InvitationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: {
    workspaceId: string;
    email: string;
    role: AssignableRole;
    tokenHash: string;
    invitedById: string;
    expiresAt: Date;
  }) {
    return this.prisma.db.invitation.create({ data, include: inviterInclude });
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.db.invitation.findFirst({ where: { id, workspaceId } });
  }

  findByTokenHash(tokenHash: string) {
    return this.prisma.db.invitation.findUnique({
      where: { tokenHash },
      include: { ...inviterInclude, workspace: { select: { name: true } } },
    });
  }

  listOpen(workspaceId: string, now: Date) {
    return this.prisma.db.invitation.findMany({
      where: { workspaceId, ...openInvitation(now) },
      include: inviterInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeOpenForEmail(workspaceId: string, email: string, now: Date) {
    await this.prisma.db.invitation.updateMany({
      where: { workspaceId, email, ...openInvitation(now) },
      data: { revokedAt: now },
    });
  }

  async markRevoked(id: string, at: Date) {
    await this.prisma.db.invitation.update({ where: { id }, data: { revokedAt: at } });
  }

  async markAccepted(id: string, userId: string, at: Date): Promise<boolean> {
    const { count } = await this.prisma.db.invitation.updateMany({
      where: { id, acceptedAt: null, revokedAt: null },
      data: { acceptedAt: at, acceptedById: userId },
    });
    return count === 1;
  }
}
