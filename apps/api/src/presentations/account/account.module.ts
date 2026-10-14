import { Module } from '@nestjs/common';
import { UsersDomainModule } from '../../domains/users/users.module';
import { MeController } from './controllers/me.controller';

@Module({ imports: [UsersDomainModule], controllers: [MeController] })
export class AccountModule {}
