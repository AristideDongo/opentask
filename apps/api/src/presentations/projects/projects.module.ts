import { Module } from '@nestjs/common';
import { ProjectsDomainModule } from '../../domains/projects/projects.module';
import { ColumnsController } from './controllers/columns.controller';
import { LabelsController } from './controllers/labels.controller';
import { ProjectsController } from './controllers/projects.controller';

@Module({
  imports: [ProjectsDomainModule],
  controllers: [ProjectsController, ColumnsController, LabelsController],
})
export class ProjectsModule {}
