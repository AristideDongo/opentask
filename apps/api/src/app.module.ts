import { type DynamicModule, Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './infrastructures/auth/auth.service';
import { InfrastructuresModule } from './infrastructures/infrastructures.module';
import { LOGGER, type Logger } from './infrastructures/logger/logger.service';
import { AccountModule } from './presentations/account/account.module';
import { ChannelsModule } from './presentations/channels/channels.module';
import { InvitationsModule } from './presentations/invitations/invitations.module';
import { ProjectsModule } from './presentations/projects/projects.module';
import { RealtimeModule } from './presentations/realtime/realtime.module';
import { SystemModule } from './presentations/system/system.module';
import { TasksModule } from './presentations/tasks/tasks.module';
import { TeamsModule } from './presentations/teams/teams.module';
import { WorkspacesModule } from './presentations/workspaces/workspaces.module';
import { ENV, type Env } from './shared/config/env';
import { ApiErrorFilter } from './shared/filters/api-error.filter';
import { SessionGuard } from './shared/guards/session.guard';

@Global()
@Module({})
class ConfigModule {
  static register(env: Env, logger: Logger): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        { provide: ENV, useValue: env },
        { provide: LOGGER, useValue: logger },
      ],
      exports: [ENV, LOGGER],
    };
  }
}

@Module({})
export class AppModule {
  static register(env: Env, logger: Logger): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register(env, logger),
        InfrastructuresModule,
        ThrottlerModule.forRoot({
          throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }],
          skipIf: () => !env.RATE_LIMIT_ENABLED,
        }),
        SystemModule,
        AccountModule,
        WorkspacesModule,
        InvitationsModule,
        TeamsModule,
        ProjectsModule,
        TasksModule,
        ChannelsModule,
        RealtimeModule,
      ],
      providers: [
        { provide: APP_FILTER, useValue: new ApiErrorFilter(logger) },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        {
          provide: APP_GUARD,
          useFactory: (auth: AuthService, reflector: Reflector) =>
            new SessionGuard(auth, reflector),
          inject: [AuthService, Reflector],
        },
      ],
    };
  }
}
