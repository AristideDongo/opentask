import { Module } from '@nestjs/common';
import { WorkspacesDomainModule } from '../../domains/workspaces/workspaces.module';
import { EventsController } from './controllers/events.controller';

@Module({ imports: [WorkspacesDomainModule], controllers: [EventsController] })
export class RealtimeModule {}
