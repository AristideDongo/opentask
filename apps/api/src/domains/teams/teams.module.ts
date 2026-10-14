import { Module } from '@nestjs/common';
import { WorkspacesDomainModule } from '../workspaces/workspaces.module';
import { TeamRepository } from './repository/team.repository';
import { AddTeamMemberUseCase } from './use-cases/add-team-member.use-case';
import { CreateTeamUseCase } from './use-cases/create-team.use-case';
import { DeleteTeamUseCase } from './use-cases/delete-team.use-case';
import { GetTeamUseCase } from './use-cases/get-team.use-case';
import { ListTeamsUseCase } from './use-cases/list-teams.use-case';
import { RemoveTeamMemberUseCase } from './use-cases/remove-team-member.use-case';
import { UpdateTeamUseCase } from './use-cases/update-team.use-case';

const useCases = [
  ListTeamsUseCase,
  GetTeamUseCase,
  CreateTeamUseCase,
  UpdateTeamUseCase,
  DeleteTeamUseCase,
  AddTeamMemberUseCase,
  RemoveTeamMemberUseCase,
];

@Module({
  imports: [WorkspacesDomainModule],
  providers: [TeamRepository, ...useCases],
  exports: [TeamRepository, ...useCases],
})
export class TeamsDomainModule {}
