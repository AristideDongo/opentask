import { Inject, Injectable } from '@nestjs/common';
import {
  API_TOKEN_PREFIX,
  type CreateApiTokenData,
  type CreatedApiToken,
} from '@opentask/contracts/tokens/api-token';
import { generateSecretToken, hashToken } from '../../../shared/utils/secret-token';
import { MAX_TOKENS_PER_USER } from '../api-tokens.const';
import { ApiTokenLimitError } from '../errors/api-token.errors';
import { tokenExpiry, tokenHint } from '../helpers/api-token.helper';
import { toApiTokenDto } from '../mappers/api-token.mapper';
import { ApiTokenRepository } from '../repository/api-token.repository';

@Injectable()
export class CreateApiTokenUseCase {
  constructor(@Inject(ApiTokenRepository) private readonly tokens: ApiTokenRepository) {}

  async execute(userId: string, input: CreateApiTokenData): Promise<CreatedApiToken> {
    if ((await this.tokens.countForUser(userId)) >= MAX_TOKENS_PER_USER) {
      throw new ApiTokenLimitError(MAX_TOKENS_PER_USER);
    }
    const token = `${API_TOKEN_PREFIX}${generateSecretToken()}`;
    const row = await this.tokens.create({
      userId,
      name: input.name,
      tokenHash: hashToken(token),
      hint: tokenHint(token),
      scopes: input.scopes,
      expiresAt: tokenExpiry(new Date(), input.expiresInDays),
    });
    return { ...toApiTokenDto(row), token };
  }
}
