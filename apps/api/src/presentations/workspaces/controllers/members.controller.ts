import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch } from '@nestjs/common';
import {
  type ChangeMemberRoleInput,
  ChangeMemberRoleInputSchema,
  type Member,
  type MemberList,
} from '@opentask/contracts/members/member';
import { ChangeMemberRoleUseCase } from '../../../domains/workspaces/use-cases/change-member-role.use-case';
import { ListMembersUseCase } from '../../../domains/workspaces/use-cases/list-members.use-case';
import { RemoveMemberUseCase } from '../../../domains/workspaces/use-cases/remove-member.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/members')
export class MembersController {
  constructor(
    @Inject(ListMembersUseCase) private readonly listMembers: ListMembersUseCase,
    @Inject(ChangeMemberRoleUseCase) private readonly changeMemberRole: ChangeMemberRoleUseCase,
    @Inject(RemoveMemberUseCase) private readonly removeMember: RemoveMemberUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<MemberList> {
    return { items: await this.listMembers.execute(userId, workspaceId) };
  }

  @Patch(':userId')
  changeRole(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('userId') targetUserId: string,
    @Body(new ZodPipe(ChangeMemberRoleInputSchema)) input: ChangeMemberRoleInput,
  ): Promise<Member> {
    return this.changeMemberRole.execute(userId, workspaceId, targetUserId, input.role);
  }

  @Delete(':userId')
  @HttpCode(204)
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('userId') targetUserId: string,
  ): Promise<void> {
    await this.removeMember.execute(userId, workspaceId, targetUserId);
  }
}
