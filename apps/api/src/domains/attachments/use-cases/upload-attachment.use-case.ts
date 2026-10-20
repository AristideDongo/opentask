import { Inject, Injectable } from '@nestjs/common';
import type { Attachment } from '@opentask/contracts/attachments/attachment';
import { StorageService } from '../../../infrastructures/storage/storage.service';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { UNLINKED_TTL_MS } from '../attachments.const';
import { EmptyFileError } from '../errors/attachment.errors';
import { storedFileFacts } from '../helpers/attachment.helper';
import { toAttachmentDto } from '../mappers/attachment.mapper';
import { AttachmentRepository } from '../repository/attachment.repository';
import type { UploadedFile } from '../types/attachment.types';

@Injectable()
export class UploadAttachmentUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(AttachmentRepository) private readonly attachments: AttachmentRepository,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {}

  async execute(
    actorId: string,
    workspaceId: string,
    file: UploadedFile | undefined,
  ): Promise<Attachment> {
    assertIsMember(await this.memberships.find(workspaceId, actorId));
    if (!file || file.size === 0) throw new EmptyFileError();
    const stale = await this.attachments.staleUnlinked(
      actorId,
      new Date(Date.now() - UNLINKED_TTL_MS),
    );
    await this.attachments.deleteMany(stale.map((s) => s.id));
    await this.storage.remove(stale.map((s) => s.storageKey));
    const facts = storedFileFacts(file.originalname, file.mimetype, file.buffer);
    const storageKey = await this.storage.save(file.buffer);
    try {
      const row = await this.attachments.create({
        workspaceId,
        uploadedById: actorId,
        size: file.size,
        storageKey,
        ...facts,
      });
      return toAttachmentDto(row);
    } catch (error) {
      await this.storage.remove([storageKey]);
      throw error;
    }
  }
}
