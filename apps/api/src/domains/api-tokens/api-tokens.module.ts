import { Module } from '@nestjs/common';
import { ApiTokenRepository } from './repository/api-token.repository';
import { AuthenticateApiTokenUseCase } from './use-cases/authenticate-api-token.use-case';
import { CreateApiTokenUseCase } from './use-cases/create-api-token.use-case';
import { ListApiTokensUseCase } from './use-cases/list-api-tokens.use-case';
import { RevokeApiTokenUseCase } from './use-cases/revoke-api-token.use-case';

const useCases = [
  ListApiTokensUseCase,
  CreateApiTokenUseCase,
  RevokeApiTokenUseCase,
  AuthenticateApiTokenUseCase,
];

@Module({ providers: [ApiTokenRepository, ...useCases], exports: useCases })
export class ApiTokensDomainModule {}
