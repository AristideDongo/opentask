import { Module } from '@nestjs/common';
import { ApiTokensDomainModule } from '../../domains/api-tokens/api-tokens.module';
import { UsersDomainModule } from '../../domains/users/users.module';
import { ApiTokensController } from './controllers/api-tokens.controller';
import { MeController } from './controllers/me.controller';

@Module({
  imports: [UsersDomainModule, ApiTokensDomainModule],
  controllers: [MeController, ApiTokensController],
})
export class AccountModule {}
