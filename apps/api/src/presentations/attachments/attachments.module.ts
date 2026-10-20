import { Module } from '@nestjs/common';
import { AttachmentsDomainModule } from '../../domains/attachments/attachments.module';
import { UploadInterceptor } from '../../shared/interceptors/upload.interceptor';
import { AttachmentsController } from './controllers/attachments.controller';

@Module({
  imports: [AttachmentsDomainModule],
  controllers: [AttachmentsController],
  providers: [UploadInterceptor],
})
export class AttachmentsModule {}
