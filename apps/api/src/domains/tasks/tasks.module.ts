import { Module } from '@nestjs/common';
import { ProjectsDomainModule } from '../projects/projects.module';
import { WorkspacesDomainModule } from '../workspaces/workspaces.module';
import { CommentRepository } from './repository/comment.repository';
import { TaskRepository } from './repository/task.repository';
import { CommentTaskUseCase } from './use-cases/comment-task.use-case';
import { CreateTaskUseCase } from './use-cases/create-task.use-case';
import { DeleteTaskUseCase } from './use-cases/delete-task.use-case';
import { GetTaskUseCase } from './use-cases/get-task.use-case';
import { ListMyTasksUseCase } from './use-cases/list-my-tasks.use-case';
import { ListTasksUseCase } from './use-cases/list-tasks.use-case';
import { UpdateTaskUseCase } from './use-cases/update-task.use-case';

const useCases = [
  ListTasksUseCase,
  ListMyTasksUseCase,
  GetTaskUseCase,
  CreateTaskUseCase,
  UpdateTaskUseCase,
  DeleteTaskUseCase,
  CommentTaskUseCase,
];

@Module({
  imports: [WorkspacesDomainModule, ProjectsDomainModule],
  providers: [TaskRepository, CommentRepository, ...useCases],
  exports: useCases,
})
export class TasksDomainModule {}
