import { Controller, Delete, Get, Inject, Param, Put } from '@nestjs/common';
import type { ChannelMemberList } from '@opentask/contracts/channels/channel';
import { AddChannelMemberUseCase } from '../../../domains/channels/use-cases/add-channel-member.use-case';
import { ListChannelMembersUseCase } from '../../../domains/channels/use-cases/list-channel-members.use-case';
import { RemoveChannelMemberUseCase } from '../../../domains/channels/use-cases/remove-channel-member.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';

@Controller('workspaces/:workspaceId/channels/:channelId/members')
export class ChannelMembersController {
  constructor(
    @Inject(ListChannelMembersUseCase) private readonly listMembers: ListChannelMembersUseCase,
    @Inject(AddChannelMemberUseCase) private readonly addMember: AddChannelMemberUseCase,
    @Inject(RemoveChannelMemberUseCase) private readonly removeMember: RemoveChannelMemberUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
  ): Promise<ChannelMemberList> {
    return { items: await this.listMembers.execute(userId, workspaceId, channelId) };
  }

  @Put(':userId')
  async add(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Param('userId') memberId: string,
  ): Promise<ChannelMemberList> {
    return { items: await this.addMember.execute(userId, workspaceId, channelId, memberId) };
  }

  @Delete(':userId')
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Param('userId') memberId: string,
  ): Promise<ChannelMemberList> {
    return { items: await this.removeMember.execute(userId, workspaceId, channelId, memberId) };
  }
}
