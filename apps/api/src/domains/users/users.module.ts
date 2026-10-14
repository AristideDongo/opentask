import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';

@Module({
  providers: [UserRepository, GetProfileUseCase, UpdateProfileUseCase],
  exports: [UserRepository, GetProfileUseCase, UpdateProfileUseCase],
})
export class UsersDomainModule {}
