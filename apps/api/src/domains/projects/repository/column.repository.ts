import { Inject, Injectable } from '@nestjs/common';
import type { TaskStatus } from '@opentask/contracts/tasks/status';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { POSITION_STEP } from '../../../shared/helpers/position.helper';

const columnSelect = { id: true, name: true, category: true, position: true } as const;

@Injectable()
export class ColumnRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: {
    workspaceId: string;
    projectId: string;
    name: string;
    category: TaskStatus;
    position: number;
  }) {
    return this.prisma.db.projectColumn.create({ data, select: columnSelect });
  }

  list(projectId: string) {
    return this.prisma.db.projectColumn.findMany({
      where: { projectId },
      select: columnSelect,
      orderBy: { position: 'asc' },
    });
  }

  update(id: string, data: { name?: string; category?: TaskStatus; position?: number }) {
    return this.prisma.db.projectColumn.update({ where: { id }, data, select: columnSelect });
  }

  async delete(id: string) {
    await this.prisma.db.projectColumn.delete({ where: { id } });
  }

  countTasks(columnId: string) {
    return this.prisma.db.task.count({ where: { columnId } });
  }

  async moveTasks(fromColumnId: string, toColumnId: string, status: TaskStatus, now: Date) {
    const [last, first] = await Promise.all([
      this.prisma.db.task.aggregate({ where: { columnId: toColumnId }, _max: { position: true } }),
      this.prisma.db.task.aggregate({
        where: { columnId: fromColumnId },
        _min: { position: true },
      }),
    ]);
    const offset = (last._max.position ?? 0) - (first._min.position ?? 0) + POSITION_STEP;
    await this.prisma.db.$executeRaw`
      UPDATE tasks SET
        column_id = ${toColumnId},
        status = ${status}::"TaskStatus",
        position = position + ${offset},
        completed_at = CASE WHEN ${status} = 'done' THEN COALESCE(completed_at, ${now}) ELSE NULL END,
        updated_at = ${now}
      WHERE column_id = ${fromColumnId}`;
  }

  async syncTaskStatus(columnId: string, status: TaskStatus, now: Date) {
    await this.prisma.db.$executeRaw`
      UPDATE tasks SET
        status = ${status}::"TaskStatus",
        completed_at = CASE WHEN ${status} = 'done' THEN COALESCE(completed_at, ${now}) ELSE NULL END,
        updated_at = ${now}
      WHERE column_id = ${columnId}`;
  }
}
