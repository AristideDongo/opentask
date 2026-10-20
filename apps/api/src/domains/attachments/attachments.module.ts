import { Module } from '@nestjs/common';
import { TasksDomainModule } from '../tasks/tasks.module';
import { WorkspacesDomainModule } from '../workspaces/workspaces.module';
import { AttachmentRepository } from './repository/attachment.repository';
import { AttachToTaskUseCase } from './use-cases/attach-to-task.use-case';
import { DeleteAttachmentUseCase } from './use-cases/delete-attachment.use-case';
import { GetAttachmentContentUseCase } from './use-cases/get-attachment-content.use-case';
import { UploadAttachmentUseCase } from './use-cases/upload-attachment.use-case';

const useCases = [
  UploadAttachmentUseCase,
  AttachToTaskUseCase,
  GetAttachmentContentUseCase,
  DeleteAttachmentUseCase,
];

@Module({
  imports: [WorkspacesDomainModule, TasksDomainModule],
  providers: [AttachmentRepository, ...useCases],
  exports: [AttachmentRepository, ...useCases],
})
export class AttachmentsDomainModule {}
