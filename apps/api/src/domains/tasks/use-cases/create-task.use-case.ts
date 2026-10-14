import { Inject, Injectable } from '@nestjs/common';
import type { CreateTaskData, Task } from '@opentask/contracts/tasks/task';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { POSITION_STEP } from '../../../shared/helpers/position.helper';
import { ProjectNotFoundError } from '../../projects/errors/project.errors';
import { resolveColumn } from '../../projects/helpers/column.helper';
import { ProjectRepository } from '../../projects/repository/project.repository';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { TaskNotFoundError } from '../errors/task.errors';
import { taskChangedEvents } from '../helpers/task-events.helper';
import { assertTaskReferencesAreValid, completionDate } from '../helpers/task.helper';
import { toTaskDto } from '../mappers/task.mapper';
import { TaskRepository } from '../repository/task.repository';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(ProjectRepository) private readonly projects: ProjectRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    projectId: string,
    input: CreateTaskData,
  ): Promise<Task> {
    const task = await this.prisma.transaction(async () => {
      const [actor, project, facts] = await Promise.all([
        this.memberships.find(workspaceId, actorId),
        this.projects.findById(workspaceId, projectId),
        this.tasks.findValidationFacts({ workspaceId, projectId, ...input }),
      ]);
      const member = assertIsMember(actor);
      if (!project) throw new ProjectNotFoundError();
      assertCan(member.role, 'task.write');
      const labelIds = assertTaskReferencesAreValid({ ...input, projectId }, facts);
      const column = resolveColumn(facts.columns, {
        columnId: input.columnId,
        status: input.status,
      });
      const last = await this.tasks.lastPosition(column.id);
      const created = await this.tasks.create({
        workspaceId,
        projectId,
        parentId: input.parentId,
        createdById: actorId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate: input.dueDate,
        assigneeId: input.assigneeId,
        columnId: column.id,
        status: column.category,
        position: last === null ? POSITION_STEP : last + POSITION_STEP,
        completedAt: completionDate(null, column.category, null, new Date()),
        labelIds,
      });
      const view = await this.tasks.findView(workspaceId, created.id);
      if (!view) throw new TaskNotFoundError();
      return view;
    });
    for (const event of taskChangedEvents(task))
      this.realtime.publish(workspaceId, event, EVERYONE);
    return toTaskDto(task);
  }
}
