import { Inject, Injectable } from '@nestjs/common';
import type { Attachment } from '@opentask/contracts/attachments/attachment';
import { EVERYONE, RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { StorageService } from '../../../infrastructures/storage/storage.service';
import { TaskNotFoundError } from '../../tasks/errors/task.errors';
import { TaskRepository } from '../../tasks/repository/task.repository';
import { assertCan, assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { EmptyFileError } from '../errors/attachment.errors';
import { storedFileFacts } from '../helpers/attachment.helper';
import { toAttachmentDto } from '../mappers/attachment.mapper';
import { AttachmentRepository } from '../repository/attachment.repository';
import type { UploadedFile } from '../types/attachment.types';

@Injectable()
export class AttachToTaskUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
    @Inject(AttachmentRepository) private readonly attachments: AttachmentRepository,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    taskId: string,
    file: UploadedFile | undefined,
  ): Promise<Attachment> {
    const [membership, task] = await Promise.all([
      this.memberships.find(workspaceId, actorId),
      this.tasks.findById(workspaceId, taskId),
    ]);
    const member = assertIsMember(membership);
    if (!task) throw new TaskNotFoundError();
    assertCan(member.role, 'task.write');
    if (!file || file.size === 0) throw new EmptyFileError();
    const facts = storedFileFacts(file.originalname, file.mimetype, file.buffer);
    const storageKey = await this.storage.save(file.buffer);
    let attachment: Attachment;
    try {
      attachment = toAttachmentDto(
        await this.attachments.create({
          workspaceId,
          uploadedById: actorId,
          taskId,
          size: file.size,
          storageKey,
          ...facts,
        }),
      );
    } catch (error) {
      await this.storage.remove([storageKey]);
      throw error;
    }
    this.realtime.publish(
      workspaceId,
      { type: 'task.changed', projectId: task.projectId, taskId },
      EVERYONE,
    );
    return attachment;
  }
}
