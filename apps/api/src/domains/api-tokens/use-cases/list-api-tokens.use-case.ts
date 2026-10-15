import { Inject, Injectable } from '@nestjs/common';
import type { ApiTokenList } from '@opentask/contracts/tokens/api-token';
import { toApiTokenDto } from '../mappers/api-token.mapper';
import { ApiTokenRepository } from '../repository/api-token.repository';

@Injectable()
export class ListApiTokensUseCase {
  constructor(@Inject(ApiTokenRepository) private readonly tokens: ApiTokenRepository) {}

  async execute(userId: string): Promise<ApiTokenList> {
    return { items: (await this.tokens.listForUser(userId)).map(toApiTokenDto) };
  }
}
