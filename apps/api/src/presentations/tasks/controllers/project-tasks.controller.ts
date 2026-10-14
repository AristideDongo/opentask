import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import {
  CreateTaskInputSchema,
  type Task,
  type TaskList,
  type TaskQuery,
  TaskQuerySchema,
} from '@opentask/contracts/tasks/task';
import type { z } from 'zod';
import { CreateTaskUseCase } from '../../../domains/tasks/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../../../domains/tasks/use-cases/list-tasks.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/projects/:projectId/tasks')
export class ProjectTasksController {
  constructor(
    @Inject(ListTasksUseCase) private readonly listTasks: ListTasksUseCase,
    @Inject(CreateTaskUseCase) private readonly createTask: CreateTaskUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query(new ZodPipe(TaskQuerySchema)) query: TaskQuery,
  ): Promise<TaskList> {
    return { items: await this.listTasks.execute(userId, workspaceId, projectId, query) };
  }

  @Post()
  create(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body(new ZodPipe(CreateTaskInputSchema)) input: z.output<typeof CreateTaskInputSchema>,
  ): Promise<Task> {
    return this.createTask.execute(userId, workspaceId, projectId, input);
  }
}
