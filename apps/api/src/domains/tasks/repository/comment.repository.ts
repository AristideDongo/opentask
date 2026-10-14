import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';

const authorInclude = { author: { select: { id: true, name: true } } } as const;

@Injectable()
export class CommentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: { workspaceId: string; taskId: string; authorId: string; body: string }) {
    return this.prisma.db.taskComment.create({ data, include: authorInclude });
  }

  listForTask(taskId: string) {
    return this.prisma.db.taskComment.findMany({
      where: { taskId },
      include: authorInclude,
      orderBy: { createdAt: 'asc' },
    });
  }
}
