import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { Prisma } from '@opentask/database/client';
import { LabelNameTakenError } from '../errors/project.errors';

const UNIQUE_VIOLATION_CODE = 'P2002';
const labelSelect = { id: true, name: true, color: true } as const;

async function withUniqueNameMapped<T>(write: Promise<T>): Promise<T> {
  try {
    return await write;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_VIOLATION_CODE
    ) {
      throw new LabelNameTakenError();
    }
    throw error;
  }
}

@Injectable()
export class LabelRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: { workspaceId: string; projectId: string; name: string; color: string }) {
    return withUniqueNameMapped(this.prisma.db.projectLabel.create({ data, select: labelSelect }));
  }

  findById(projectId: string, id: string) {
    return this.prisma.db.projectLabel.findFirst({ where: { id, projectId }, select: labelSelect });
  }

  list(projectId: string) {
    return this.prisma.db.projectLabel.findMany({
      where: { projectId },
      select: labelSelect,
      orderBy: { name: 'asc' },
    });
  }

  count(projectId: string) {
    return this.prisma.db.projectLabel.count({ where: { projectId } });
  }

  update(id: string, data: { name?: string; color?: string }) {
    return withUniqueNameMapped(
      this.prisma.db.projectLabel.update({ where: { id }, data, select: labelSelect }),
    );
  }

  async delete(id: string) {
    await this.prisma.db.projectLabel.delete({ where: { id } });
  }
}
