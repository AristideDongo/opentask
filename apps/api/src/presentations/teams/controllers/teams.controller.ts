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
  Put,
} from '@nestjs/common';
import {
  CreateTeamInputSchema,
  type Team,
  type TeamList,
  type UpdateTeamInput,
  UpdateTeamInputSchema,
} from '@opentask/contracts/teams/team';
import type { z } from 'zod';
import { AddTeamMemberUseCase } from '../../../domains/teams/use-cases/add-team-member.use-case';
import { CreateTeamUseCase } from '../../../domains/teams/use-cases/create-team.use-case';
import { DeleteTeamUseCase } from '../../../domains/teams/use-cases/delete-team.use-case';
import { GetTeamUseCase } from '../../../domains/teams/use-cases/get-team.use-case';
import { ListTeamsUseCase } from '../../../domains/teams/use-cases/list-teams.use-case';
import { RemoveTeamMemberUseCase } from '../../../domains/teams/use-cases/remove-team-member.use-case';
import { UpdateTeamUseCase } from '../../../domains/teams/use-cases/update-team.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/teams')
export class TeamsController {
  constructor(
    @Inject(ListTeamsUseCase) private readonly listTeams: ListTeamsUseCase,
    @Inject(CreateTeamUseCase) private readonly createTeam: CreateTeamUseCase,
    @Inject(GetTeamUseCase) private readonly getTeam: GetTeamUseCase,
    @Inject(UpdateTeamUseCase) private readonly updateTeam: UpdateTeamUseCase,
    @Inject(DeleteTeamUseCase) private readonly deleteTeam: DeleteTeamUseCase,
    @Inject(AddTeamMemberUseCase) private readonly addTeamMember: AddTeamMemberUseCase,
    @Inject(RemoveTeamMemberUseCase) private readonly removeTeamMember: RemoveTeamMemberUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<TeamList> {
    return { items: await this.listTeams.execute(userId, workspaceId) };
  }

  @Post()
  create(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodPipe(CreateTeamInputSchema)) input: z.output<typeof CreateTeamInputSchema>,
  ): Promise<Team> {
    return this.createTeam.execute(userId, workspaceId, input);
  }

  @Get(':teamId')
  get(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
  ): Promise<Team> {
    return this.getTeam.execute(userId, workspaceId, teamId);
  }

  @Patch(':teamId')
  update(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Body(new ZodPipe(UpdateTeamInputSchema)) input: UpdateTeamInput,
  ): Promise<Team> {
    return this.updateTeam.execute(userId, workspaceId, teamId, input);
  }

  @Delete(':teamId')
  @HttpCode(204)
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
  ): Promise<void> {
    await this.deleteTeam.execute(userId, workspaceId, teamId);
  }

  @Put(':teamId/members/:userId')
  addMember(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('userId') memberId: string,
  ): Promise<Team> {
    return this.addTeamMember.execute(userId, workspaceId, teamId, memberId);
  }

  @Delete(':teamId/members/:userId')
  removeMember(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('userId') memberId: string,
  ): Promise<Team> {
    return this.removeTeamMember.execute(userId, workspaceId, teamId, memberId);
  }
}
