import { Inject, Injectable } from '@nestjs/common';
import type { TaskPriority, TaskStatus } from '@opentask/contracts/tasks/status';
import type { TaskQuery } from '@opentask/contracts/tasks/task';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import type { Prisma } from '@opentask/database/client';
import type { FindTaskFactsOptions, TaskValidationFacts } from '../types/task.types';

const userRef = { select: { id: true, name: true } } as const;

export const taskInclude = {
  column: { select: { id: true, name: true } },
  assignee: { include: { user: userRef } },
  createdBy: userRef,
  labels: {
    select: { label: { select: { id: true, name: true, color: true } } },
    orderBy: { label: { name: 'asc' } },
  },
  subtasks: { select: { status: true } },
  _count: { select: { comments: true } },
} as const satisfies Prisma.TaskInclude;

export type TaskRow = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

const TASK_ORDER: Record<TaskQuery['sort'], Prisma.TaskOrderByWithRelationInput[]> = {
  position: [{ column: { position: 'asc' } }, { position: 'asc' }],
  dueDate: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { position: 'asc' }],
  priority: [{ priority: 'desc' }, { position: 'asc' }],
  createdAt: [{ createdAt: 'desc' }],
  title: [{ title: 'asc' }],
};

const toDateColumn = (day: string | null | undefined) =>
  day === undefined ? undefined : day === null ? null : new Date(`${day}T00:00:00.000Z`);

export interface TaskWrite {
  title?: string;
  description?: string;
  columnId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  position?: number;
  completedAt?: Date | null;
}

@Injectable()
export class TaskRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findValidationFacts(options: FindTaskFactsOptions): Promise<TaskValidationFacts> {
    const db = this.prisma.db;
    const labelIds = [...new Set(options.labelIds ?? [])];
    const [columns, parent, assignees, labels] = await Promise.all([
      db.projectColumn.findMany({
        where: { projectId: options.projectId },
        select: { id: true, name: true, category: true, position: true },
        orderBy: { position: 'asc' },
      }),
      options.parentId
        ? db.task.findFirst({
            where: { id: options.parentId, workspaceId: options.workspaceId },
            select: { projectId: true, parentId: true },
          })
        : Promise.resolve(null),
      options.assigneeId
        ? db.workspaceMember.count({
            where: { workspaceId: options.workspaceId, userId: options.assigneeId },
          })
        : Promise.resolve(0),
      labelIds.length > 0
        ? db.projectLabel.findMany({
            where: { projectId: options.projectId, id: { in: labelIds } },
            select: { id: true },
          })
        : Promise.resolve([]),
    ]);
    return {
      columns,
      parent,
      assigneeIsMember: assignees > 0,
      existingLabelIds: labels.map((l) => l.id),
    };
  }

  create(
    data: TaskWrite & {
      workspaceId: string;
      projectId: string;
      parentId: string | null;
      createdById: string;
      title: string;
      columnId: string;
      status: TaskStatus;
      position: number;
      labelIds: string[];
    },
  ) {
    const { labelIds, dueDate, ...task } = data;
    return this.prisma.db.task.create({
      data: {
        ...task,
        dueDate: toDateColumn(dueDate),
        labels: { create: labelIds.map((labelId) => ({ labelId })) },
      },
    });
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.db.task.findFirst({ where: { id, workspaceId } });
  }

  findView(workspaceId: string, id: string) {
    return this.prisma.db.task.findFirst({ where: { id, workspaceId }, include: taskInclude });
  }

  list(projectId: string, query: TaskQuery) {
    return this.prisma.db.task.findMany({
      where: {
        projectId,
        ...(query.includeSubtasks ? {} : { parentId: null }),
        ...(query.status ? { status: query.status } : {}),
        ...(query.columnId ? { columnId: query.columnId } : {}),
        ...(query.priority ? { priority: query.priority } : {}),
        ...(query.assigneeId === 'none'
          ? { assigneeId: null }
          : query.assigneeId
            ? { assigneeId: query.assigneeId }
            : {}),
        ...(query.labelId ? { labels: { some: { labelId: query.labelId } } } : {}),
        ...(query.q ? { title: { contains: query.q, mode: 'insensitive' } } : {}),
      },
      include: taskInclude,
      orderBy: TASK_ORDER[query.sort],
      take: 1000,
    });
  }

  listAssigned(workspaceId: string, userId: string) {
    return this.prisma.db.task.findMany({
      where: { workspaceId, assigneeId: userId, status: { not: 'done' } },
      include: { ...taskInclude, project: { select: { name: true } } },
      orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { priority: 'desc' }],
      take: 500,
    });
  }

  listSubtasks(parentId: string) {
    return this.prisma.db.task.findMany({
      where: { parentId },
      include: taskInclude,
      orderBy: { position: 'asc' },
    });
  }

  projectName(projectId: string) {
    return this.prisma.db.project
      .findUnique({ where: { id: projectId }, select: { name: true } })
      .then((p) => p?.name ?? '');
  }

  async update(id: string, data: TaskWrite) {
    const { dueDate, ...fields } = data;
    await this.prisma.db.task.update({
      where: { id },
      data: { ...fields, dueDate: toDateColumn(dueDate) },
    });
  }

  async setLabels(taskId: string, labelIds: string[]) {
    await this.prisma.db.taskLabel.deleteMany({ where: { taskId } });
    if (labelIds.length > 0)
      await this.prisma.db.taskLabel.createMany({
        data: labelIds.map((labelId) => ({ taskId, labelId })),
      });
  }

  async delete(id: string) {
    await this.prisma.db.task.delete({ where: { id } });
  }

  async lastPosition(columnId: string, excludeId?: string) {
    const task = await this.prisma.db.task.findFirst({
      where: { columnId, ...(excludeId ? { id: { not: excludeId } } : {}) },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return task?.position ?? null;
  }

  async previousPosition(columnId: string, position: number, excludeId: string) {
    const task = await this.prisma.db.task.findFirst({
      where: { columnId, position: { lt: position }, id: { not: excludeId } },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return task?.position ?? null;
  }
}
