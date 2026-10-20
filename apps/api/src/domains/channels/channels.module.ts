import { Module } from '@nestjs/common';
import { AttachmentRepository } from '../attachments/repository/attachment.repository';
import { MentionRepository } from '../mentions/repository/mention.repository';
import { WorkspacesDomainModule } from '../workspaces/workspaces.module';
import { ChannelRepository } from './repository/channel.repository';
import { MessageRepository } from './repository/message.repository';
import { AddChannelMemberUseCase } from './use-cases/add-channel-member.use-case';
import { CreateChannelUseCase } from './use-cases/create-channel.use-case';
import { DeleteChannelUseCase } from './use-cases/delete-channel.use-case';
import { DeleteMessageUseCase } from './use-cases/delete-message.use-case';
import { EditMessageUseCase } from './use-cases/edit-message.use-case';
import { GetChannelUseCase } from './use-cases/get-channel.use-case';
import { ListChannelMembersUseCase } from './use-cases/list-channel-members.use-case';
import { ListChannelsUseCase } from './use-cases/list-channels.use-case';
import { ListMessagesUseCase } from './use-cases/list-messages.use-case';
import { MarkChannelReadUseCase } from './use-cases/mark-channel-read.use-case';
import { RemoveChannelMemberUseCase } from './use-cases/remove-channel-member.use-case';
import { SendMessageUseCase } from './use-cases/send-message.use-case';
import { UpdateChannelUseCase } from './use-cases/update-channel.use-case';

const useCases = [
  ListChannelsUseCase,
  GetChannelUseCase,
  CreateChannelUseCase,
  UpdateChannelUseCase,
  DeleteChannelUseCase,
  ListChannelMembersUseCase,
  AddChannelMemberUseCase,
  RemoveChannelMemberUseCase,
  ListMessagesUseCase,
  SendMessageUseCase,
  EditMessageUseCase,
  DeleteMessageUseCase,
  MarkChannelReadUseCase,
];

@Module({
  imports: [WorkspacesDomainModule],
  providers: [
    ChannelRepository,
    MessageRepository,
    AttachmentRepository,
    MentionRepository,
    ...useCases,
  ],
  exports: useCases,
})
export class ChannelsDomainModule {}
