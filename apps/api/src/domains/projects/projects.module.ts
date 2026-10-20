import { Module } from '@nestjs/common';
import { AttachmentRepository } from '../attachments/repository/attachment.repository';
import { UsersDomainModule } from '../users/users.module';
import { WorkspacesDomainModule } from '../workspaces/workspaces.module';
import { ColumnRepository } from './repository/column.repository';
import { LabelRepository } from './repository/label.repository';
import { ProjectRepository } from './repository/project.repository';
import { CreateColumnUseCase } from './use-cases/create-column.use-case';
import { CreateLabelUseCase } from './use-cases/create-label.use-case';
import { CreateProjectUseCase } from './use-cases/create-project.use-case';
import { DeleteColumnUseCase } from './use-cases/delete-column.use-case';
import { DeleteLabelUseCase } from './use-cases/delete-label.use-case';
import { DeleteProjectUseCase } from './use-cases/delete-project.use-case';
import { GetProjectUseCase } from './use-cases/get-project.use-case';
import { ListColumnsUseCase } from './use-cases/list-columns.use-case';
import { ListLabelsUseCase } from './use-cases/list-labels.use-case';
import { ListProjectsUseCase } from './use-cases/list-projects.use-case';
import { UpdateColumnUseCase } from './use-cases/update-column.use-case';
import { UpdateLabelUseCase } from './use-cases/update-label.use-case';
import { UpdateProjectUseCase } from './use-cases/update-project.use-case';

const useCases = [
  ListProjectsUseCase,
  GetProjectUseCase,
  CreateProjectUseCase,
  UpdateProjectUseCase,
  DeleteProjectUseCase,
  ListColumnsUseCase,
  CreateColumnUseCase,
  UpdateColumnUseCase,
  DeleteColumnUseCase,
  ListLabelsUseCase,
  CreateLabelUseCase,
  UpdateLabelUseCase,
  DeleteLabelUseCase,
];

@Module({
  imports: [WorkspacesDomainModule, UsersDomainModule],
  providers: [
    AttachmentRepository,
    ProjectRepository,
    ColumnRepository,
    LabelRepository,
    ...useCases,
  ],
  exports: [ProjectRepository, ColumnRepository, LabelRepository, ...useCases],
})
export class ProjectsDomainModule {}
