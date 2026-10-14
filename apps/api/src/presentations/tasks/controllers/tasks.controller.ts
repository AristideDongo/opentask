import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  type CreateCommentInput,
  CreateCommentInputSchema,
  type TaskComment,
} from '@opentask/contracts/tasks/comment';
import {
  type MyTaskList,
  type Task,
  type TaskDetail,
  type UpdateTaskInput,
  UpdateTaskInputSchema,
} from '@opentask/contracts/tasks/task';
import { CommentTaskUseCase } from '../../../domains/tasks/use-cases/comment-task.use-case';
import { DeleteTaskUseCase } from '../../../domains/tasks/use-cases/delete-task.use-case';
import { GetTaskUseCase } from '../../../domains/tasks/use-cases/get-task.use-case';
import { ListMyTasksUseCase } from '../../../domains/tasks/use-cases/list-my-tasks.use-case';
import { UpdateTaskUseCase } from '../../../domains/tasks/use-cases/update-task.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId')
export class TasksController {
  constructor(
    @Inject(ListMyTasksUseCase) private readonly listMyTasks: ListMyTasksUseCase,
    @Inject(GetTaskUseCase) private readonly getTask: GetTaskUseCase,
    @Inject(UpdateTaskUseCase) private readonly updateTask: UpdateTaskUseCase,
    @Inject(DeleteTaskUseCase) private readonly deleteTask: DeleteTaskUseCase,
    @Inject(CommentTaskUseCase) private readonly commentTask: CommentTaskUseCase,
  ) {}

  @Get('my-tasks')
  async mine(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<MyTaskList> {
    return { items: await this.listMyTasks.execute(userId, workspaceId) };
  }

  @Get('tasks/:taskId')
  get(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
  ): Promise<TaskDetail> {
    return this.getTask.execute(userId, workspaceId, taskId);
  }

  @Patch('tasks/:taskId')
  update(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Body(new ZodPipe(UpdateTaskInputSchema)) input: UpdateTaskInput,
  ): Promise<Task> {
    return this.updateTask.execute(userId, workspaceId, taskId, input);
  }

  @Delete('tasks/:taskId')
  @HttpCode(204)
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
  ): Promise<void> {
    await this.deleteTask.execute(userId, workspaceId, taskId);
  }

  @Post('tasks/:taskId/comments')
  comment(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Body(new ZodPipe(CreateCommentInputSchema)) input: CreateCommentInput,
  ): Promise<TaskComment> {
    return this.commentTask.execute(userId, workspaceId, taskId, input.body);
  }
}
