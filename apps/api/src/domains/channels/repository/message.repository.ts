import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';

const authorInclude = { author: { select: { id: true, name: true } } } as const;

@Injectable()
export class MessageRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: { workspaceId: string; channelId: string; authorId: string; body: string }) {
    return this.prisma.db.message.create({ data, include: authorInclude });
  }

  findById(channelId: string, id: string) {
    return this.prisma.db.message.findFirst({ where: { id, channelId } });
  }

  async list(channelId: string, query: { cursor?: string; limit: number }) {
    const rows = await this.prisma.db.message.findMany({
      where: { channelId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: authorInclude,
    });
    const items = rows.slice(0, query.limit);
    return { items, nextCursor: rows.length > query.limit ? (items.at(-1)?.id ?? null) : null };
  }

  update(id: string, data: { body: string; editedAt: Date }) {
    return this.prisma.db.message.update({ where: { id }, data, include: authorInclude });
  }

  softDelete(id: string, at: Date) {
    return this.prisma.db.message.update({
      where: { id },
      data: { deletedAt: at, body: '' },
      include: authorInclude,
    });
  }
}
