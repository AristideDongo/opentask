import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import type { Prisma } from '@opentask/database/client';
import type { AuditEntryInput } from '../types/workspace.types';

@Injectable()
export class AuditLogRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async record(entry: AuditEntryInput) {
    await this.prisma.db.auditLog.create({
      data: { ...entry, metadata: (entry.metadata ?? {}) as Prisma.InputJsonObject },
    });
  }

  async list(workspaceId: string, query: { cursor?: string; limit: number }) {
    const rows = await this.prisma.db.auditLog.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: { actor: { select: { id: true, name: true } } },
    });
    const items = rows.slice(0, query.limit);
    return { items, nextCursor: rows.length > query.limit ? (items.at(-1)?.id ?? null) : null };
  }
}
