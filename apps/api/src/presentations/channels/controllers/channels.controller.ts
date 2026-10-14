import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  type Channel,
  type ChannelList,
  CreateChannelInputSchema,
  type UpdateChannelInput,
  UpdateChannelInputSchema,
} from '@opentask/contracts/channels/channel';
import type { z } from 'zod';
import { CreateChannelUseCase } from '../../../domains/channels/use-cases/create-channel.use-case';
import { DeleteChannelUseCase } from '../../../domains/channels/use-cases/delete-channel.use-case';
import { GetChannelUseCase } from '../../../domains/channels/use-cases/get-channel.use-case';
import { ListChannelsUseCase } from '../../../domains/channels/use-cases/list-channels.use-case';
import { MarkChannelReadUseCase } from '../../../domains/channels/use-cases/mark-channel-read.use-case';
import { UpdateChannelUseCase } from '../../../domains/channels/use-cases/update-channel.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/channels')
export class ChannelsController {
  constructor(
    @Inject(ListChannelsUseCase) private readonly listChannels: ListChannelsUseCase,
    @Inject(CreateChannelUseCase) private readonly createChannel: CreateChannelUseCase,
    @Inject(GetChannelUseCase) private readonly getChannel: GetChannelUseCase,
    @Inject(UpdateChannelUseCase) private readonly updateChannel: UpdateChannelUseCase,
    @Inject(DeleteChannelUseCase) private readonly deleteChannel: DeleteChannelUseCase,
    @Inject(MarkChannelReadUseCase) private readonly markChannelRead: MarkChannelReadUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ChannelList> {
    return { items: await this.listChannels.execute(userId, workspaceId) };
  }

  @Post()
  create(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodPipe(CreateChannelInputSchema)) input: z.output<typeof CreateChannelInputSchema>,
  ): Promise<Channel> {
    return this.createChannel.execute(userId, workspaceId, input);
  }

  @Get(':channelId')
  get(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
  ): Promise<Channel> {
    return this.getChannel.execute(userId, workspaceId, channelId);
  }

  @Patch(':channelId')
  update(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Body(new ZodPipe(UpdateChannelInputSchema)) input: UpdateChannelInput,
  ): Promise<Channel> {
    return this.updateChannel.execute(userId, workspaceId, channelId, input);
  }

  @Delete(':channelId')
  @HttpCode(204)
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
  ): Promise<void> {
    await this.deleteChannel.execute(userId, workspaceId, channelId);
  }

  @Post(':channelId/read')
  @HttpCode(204)
  async read(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
  ): Promise<void> {
    await this.markChannelRead.execute(userId, workspaceId, channelId);
  }
}
