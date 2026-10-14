import { Module } from '@nestjs/common';
import { TasksDomainModule } from '../../domains/tasks/tasks.module';
import { ProjectTasksController } from './controllers/project-tasks.controller';
import { TasksController } from './controllers/tasks.controller';

@Module({ imports: [TasksDomainModule], controllers: [ProjectTasksController, TasksController] })
export class TasksModule {}
