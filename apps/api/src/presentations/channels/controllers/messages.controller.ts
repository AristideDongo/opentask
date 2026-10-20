import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  type Message,
  type MessageData,
  type MessageEditInput,
  MessageEditInputSchema,
  MessageInputSchema,
  type MessagePage,
} from '@opentask/contracts/channels/message';
import { type CursorQuery, CursorQuerySchema } from '@opentask/contracts/common/pagination';
import { DeleteMessageUseCase } from '../../../domains/channels/use-cases/delete-message.use-case';
import { EditMessageUseCase } from '../../../domains/channels/use-cases/edit-message.use-case';
import { ListMessagesUseCase } from '../../../domains/channels/use-cases/list-messages.use-case';
import { SendMessageUseCase } from '../../../domains/channels/use-cases/send-message.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/channels/:channelId/messages')
export class MessagesController {
  constructor(
    @Inject(ListMessagesUseCase) private readonly listMessages: ListMessagesUseCase,
    @Inject(SendMessageUseCase) private readonly sendMessage: SendMessageUseCase,
    @Inject(EditMessageUseCase) private readonly editMessage: EditMessageUseCase,
    @Inject(DeleteMessageUseCase) private readonly deleteMessage: DeleteMessageUseCase,
  ) {}

  @Get()
  list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Query(new ZodPipe(CursorQuerySchema)) query: CursorQuery,
  ): Promise<MessagePage> {
    return this.listMessages.execute(userId, workspaceId, channelId, query);
  }

  @Post()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  send(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Body(new ZodPipe(MessageInputSchema)) input: MessageData,
  ): Promise<Message> {
    return this.sendMessage.execute(userId, workspaceId, channelId, input);
  }

  @Patch(':messageId')
  edit(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Param('messageId') messageId: string,
    @Body(new ZodPipe(MessageEditInputSchema)) input: MessageEditInput,
  ): Promise<Message> {
    return this.editMessage.execute(userId, workspaceId, channelId, messageId, input.body);
  }

  @Delete(':messageId')
  remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Param('messageId') messageId: string,
  ): Promise<Message> {
    return this.deleteMessage.execute(userId, workspaceId, channelId, messageId);
  }
}
