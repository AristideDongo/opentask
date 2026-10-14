import { Module } from '@nestjs/common';
import { ChannelsDomainModule } from '../../domains/channels/channels.module';
import { ChannelMembersController } from './controllers/channel-members.controller';
import { ChannelsController } from './controllers/channels.controller';
import { MessagesController } from './controllers/messages.controller';

@Module({
  imports: [ChannelsDomainModule],
  controllers: [ChannelsController, ChannelMembersController, MessagesController],
})
export class ChannelsModule {}
