import { Module } from '@nestjs/common';
import { TeamsDomainModule } from '../../domains/teams/teams.module';
import { TeamsController } from './controllers/teams.controller';

@Module({ imports: [TeamsDomainModule], controllers: [TeamsController] })
export class TeamsModule {}
