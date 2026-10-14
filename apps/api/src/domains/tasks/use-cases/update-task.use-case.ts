import { Inject, Injectable } from '@nestjs/common';
import type { Task, UpdateTaskInput } from '@opentask/contracts/tasks/task';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { POSITION_STEP, positionBetween } from '../../../shared/helpers/position.helper';
import { resolveColumn } from '../../projects/helpers/column.helper';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { InvalidTaskPositionError, TaskNotFoundError } from '../errors/task.errors';
import { taskChangedEvents } from '../helpers/task-events.helper';
import { assertTaskReferencesAreValid, completionDate } from '../helpers/task.helper';
import { toTaskDto } from '../mappers/task.mapper';
import { type TaskWrite, TaskRepository } from '../repository/task.repository';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<Task> {
    const task = await this.prisma.transaction(async () => {
      const [actor, current] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.tasks.findById(workspaceId, taskId),
      ]);
      const member = assertIsMember(actor);
      if (!current) throw new TaskNotFoundError();
      assertCan(member.role, 'task.write');

      const { beforeTaskId, labelIds, columnId, status, ...fields } = input;
      const facts = await this.tasks.findValidationFacts({
        workspaceId,
        projectId: current.projectId,
        assigneeId: fields.assigneeId,
        labelIds,
      });
      const validLabelIds = assertTaskReferencesAreValid(
        { projectId: current.projectId, assigneeId: fields.assigneeId, labelIds },
        facts,
      );
      if (labelIds !== undefined) await this.tasks.setLabels(taskId, validLabelIds);

      const write: TaskWrite = { ...fields };
      let targetColumnId = current.columnId;
      if (columnId || (status && status !== current.status)) {
        const column = resolveColumn(facts.columns, columnId ? { columnId } : { status });
        if (column.id !== current.columnId) {
          targetColumnId = column.id;
          write.columnId = column.id;
          write.status = column.category;
          write.completedAt = completionDate(
            current.status,
            column.category,
            current.completedAt,
            new Date(),
          );
        }
      }
      if (beforeTaskId !== undefined) {
        write.position = await this.positionBefore(
          workspaceId,
          targetColumnId,
          taskId,
          beforeTaskId,
        );
      } else if (targetColumnId !== current.columnId) {
        const last = await this.tasks.lastPosition(targetColumnId, taskId);
        write.position = last === null ? POSITION_STEP : last + POSITION_STEP;
      }
      if (Object.keys(write).length > 0) await this.tasks.update(taskId, write);
      const view = await this.tasks.findView(workspaceId, taskId);
      if (!view) throw new TaskNotFoundError();
      return view;
    });
    for (const event of taskChangedEvents(task))
      this.realtime.publish(workspaceId, event, EVERYONE);
    return toTaskDto(task);
  }

  private async positionBefore(
    workspaceId: string,
    columnId: string,
    taskId: string,
    beforeTaskId: string | null,
  ) {
    if (beforeTaskId === null)
      return positionBetween(await this.tasks.lastPosition(columnId, taskId), null);
    const before = await this.tasks.findById(workspaceId, beforeTaskId);
    if (!before || before.columnId !== columnId || before.id === taskId)
      throw new InvalidTaskPositionError();
    return positionBetween(
      await this.tasks.previousPosition(columnId, before.position, taskId),
      before.position,
    );
  }
}
