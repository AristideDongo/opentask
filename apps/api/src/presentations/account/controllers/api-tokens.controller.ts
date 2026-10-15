import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import {
  type ApiTokenList,
  type CreateApiTokenData,
  CreateApiTokenInputSchema,
  type CreatedApiToken,
} from '@opentask/contracts/tokens/api-token';
import { CreateApiTokenUseCase } from '../../../domains/api-tokens/use-cases/create-api-token.use-case';
import { ListApiTokensUseCase } from '../../../domains/api-tokens/use-cases/list-api-tokens.use-case';
import { RevokeApiTokenUseCase } from '../../../domains/api-tokens/use-cases/revoke-api-token.use-case';
import { SessionOnly } from '../../../shared/decorators/session-only.decorator';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('me/api-tokens')
@SessionOnly()
export class ApiTokensController {
  constructor(
    @Inject(ListApiTokensUseCase) private readonly listTokens: ListApiTokensUseCase,
    @Inject(CreateApiTokenUseCase) private readonly createToken: CreateApiTokenUseCase,
    @Inject(RevokeApiTokenUseCase) private readonly revokeToken: RevokeApiTokenUseCase,
  ) {}

  @Get()
  list(@UserId() userId: string): Promise<ApiTokenList> {
    return this.listTokens.execute(userId);
  }

  @Post()
  create(
    @UserId() userId: string,
    @Body(new ZodPipe(CreateApiTokenInputSchema)) input: CreateApiTokenData,
  ): Promise<CreatedApiToken> {
    return this.createToken.execute(userId, input);
  }

  @Delete(':tokenId')
  @HttpCode(204)
  revoke(@UserId() userId: string, @Param('tokenId') tokenId: string): Promise<void> {
    return this.revokeToken.execute(userId, tokenId);
  }
}
