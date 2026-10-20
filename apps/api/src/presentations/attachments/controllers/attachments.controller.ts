import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Attachment } from '@opentask/contracts/attachments/attachment';
import type { Response } from 'express';
import { DOWNLOAD_CACHE_CONTROL } from '../../../domains/attachments/attachments.const';
import type { UploadedFile as UploadedFileData } from '../../../domains/attachments/types/attachment.types';
import { AttachToTaskUseCase } from '../../../domains/attachments/use-cases/attach-to-task.use-case';
import { DeleteAttachmentUseCase } from '../../../domains/attachments/use-cases/delete-attachment.use-case';
import { GetAttachmentContentUseCase } from '../../../domains/attachments/use-cases/get-attachment-content.use-case';
import { UploadAttachmentUseCase } from '../../../domains/attachments/use-cases/upload-attachment.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { UploadInterceptor } from '../../../shared/interceptors/upload.interceptor';

const UPLOAD_THROTTLE = { default: { limit: 30, ttl: 60_000 } };

@Controller('workspaces/:workspaceId')
export class AttachmentsController {
  constructor(
    @Inject(UploadAttachmentUseCase) private readonly upload: UploadAttachmentUseCase,
    @Inject(AttachToTaskUseCase) private readonly attachToTask: AttachToTaskUseCase,
    @Inject(GetAttachmentContentUseCase) private readonly content: GetAttachmentContentUseCase,
    @Inject(DeleteAttachmentUseCase) private readonly deleteAttachment: DeleteAttachmentUseCase,
  ) {}

  @Post('attachments')
  @Throttle(UPLOAD_THROTTLE)
  @UseInterceptors(UploadInterceptor)
  create(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @UploadedFile() file: UploadedFileData | undefined,
  ): Promise<Attachment> {
    return this.upload.execute(userId, workspaceId, file);
  }

  @Post('tasks/:taskId/attachments')
  @Throttle(UPLOAD_THROTTLE)
  @UseInterceptors(UploadInterceptor)
  attach(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @UploadedFile() file: UploadedFileData | undefined,
  ): Promise<Attachment> {
    return this.attachToTask.execute(userId, workspaceId, taskId, file);
  }

  @Get('attachments/:attachmentId/content')
  async download(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { headers, stream } = await this.content.execute(userId, workspaceId, attachmentId);
    res.set({ ...headers, 'Cache-Control': DOWNLOAD_CACHE_CONTROL });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  }

  @Delete('attachments/:attachmentId')
  @HttpCode(204)
  remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<void> {
    return this.deleteAttachment.execute(userId, workspaceId, attachmentId);
  }
}
