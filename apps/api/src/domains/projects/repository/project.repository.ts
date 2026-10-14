import { Inject, Injectable } from '@nestjs/common';
import { TASK_STATUSES, type TaskStatus } from '@opentask/contracts/tasks/status';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import type { Prisma } from '@opentask/database/client';
import { POSITION_STEP } from '../../../shared/helpers/position.helper';

export const projectInclude = {
  team: { select: { id: true, name: true } },
  labels: { select: { id: true, name: true, color: true }, orderBy: { name: 'asc' } },
  columns: {
    select: { id: true, name: true, category: true, position: true },
    orderBy: { position: 'asc' },
  },
} as const satisfies Prisma.ProjectInclude;

export type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof projectInclude }> & {
  taskCounts: Record<TaskStatus, number>;
};

@Injectable()
export class ProjectRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: {
    workspaceId: string;
    createdById: string;
    name: string;
    description: string;
    teamId: string | null;
    columns: { name: string; category: TaskStatus }[];
  }) {
    const { columns, ...project } = data;
    return this.prisma.db.project.create({
      data: {
        ...project,
        columns: {
          create: columns.map((c, i) => ({
            ...c,
            workspaceId: data.workspaceId,
            position: (i + 1) * POSITION_STEP,
          })),
        },
      },
    });
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.db.project.findFirst({ where: { id, workspaceId } });
  }

  async list(workspaceId: string): Promise<ProjectRow[]> {
    return this.withTaskCounts(
      await this.prisma.db.project.findMany({
        where: { workspaceId },
        include: projectInclude,
        orderBy: { name: 'asc' },
      }),
    );
  }

  async findView(workspaceId: string, id: string): Promise<ProjectRow | null> {
    const project = await this.prisma.db.project.findFirst({
      where: { id, workspaceId },
      include: projectInclude,
    });
    return project ? ((await this.withTaskCounts([project]))[0] ?? null) : null;
  }

  async update(id: string, data: { name?: string; description?: string; teamId?: string | null }) {
    await this.prisma.db.project.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.db.project.delete({ where: { id } });
  }

  teamExists(workspaceId: string, teamId: string) {
    return this.prisma.db.team.count({ where: { id: teamId, workspaceId } }).then((n) => n > 0);
  }

  private async withTaskCounts(
    projects: Prisma.ProjectGetPayload<{ include: typeof projectInclude }>[],
  ): Promise<ProjectRow[]> {
    const counts = await this.prisma.db.task.groupBy({
      by: ['projectId', 'status'],
      where: { projectId: { in: projects.map((p) => p.id) }, parentId: null },
      _count: { _all: true },
    });
    return projects.map((p) => {
      const taskCounts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as Record<
        TaskStatus,
        number
      >;
      for (const c of counts) if (c.projectId === p.id) taskCounts[c.status] = c._count._all;
      return { ...p, taskCounts };
    });
  }
}
