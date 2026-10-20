import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@opentask/database/client';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';

export const attachmentInclude = { uploadedBy: { select: { id: true, name: true } } } as const;

export type AttachmentRow = Prisma.AttachmentGetPayload<{ include: typeof attachmentInclude }>;

@Injectable()
export class AttachmentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: {
    workspaceId: string;
    uploadedById: string;
    taskId?: string;
    fileName: string;
    mimeType: string;
    size: number;
    isImage: boolean;
    storageKey: string;
  }) {
    return this.prisma.db.attachment.create({ data, include: attachmentInclude });
  }

  findWithAccess(workspaceId: string, id: string, actorId: string) {
    return this.prisma.db.attachment.findFirst({
      where: { id, workspaceId },
      include: {
        ...attachmentInclude,
        message: {
          select: {
            authorId: true,
            channel: {
              select: {
                isPrivate: true,
                members: { where: { userId: actorId }, select: { userId: true } },
              },
            },
          },
        },
      },
    });
  }

  listForTask(taskId: string) {
    return this.prisma.db.attachment.findMany({
      where: { taskId },
      include: attachmentInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async linkToMessage(ids: string[], messageId: string, uploaderId: string, workspaceId: string) {
    if (ids.length === 0) return 0;
    const { count } = await this.prisma.db.attachment.updateMany({
      where: {
        id: { in: ids },
        uploadedById: uploaderId,
        workspaceId,
        taskId: null,
        messageId: null,
      },
      data: { messageId },
    });
    return count;
  }

  delete(id: string) {
    return this.prisma.db.attachment.delete({ where: { id } });
  }

  async staleUnlinked(uploaderId: string, before: Date) {
    return this.prisma.db.attachment.findMany({
      where: { uploadedById: uploaderId, taskId: null, messageId: null, createdAt: { lt: before } },
      select: { id: true, storageKey: true },
    });
  }

  async deleteMany(ids: string[]) {
    if (ids.length) await this.prisma.db.attachment.deleteMany({ where: { id: { in: ids } } });
  }

  async storageKeys(where: Prisma.AttachmentWhereInput) {
    const rows = await this.prisma.db.attachment.findMany({ where, select: { storageKey: true } });
    return rows.map((row) => row.storageKey);
  }
}
