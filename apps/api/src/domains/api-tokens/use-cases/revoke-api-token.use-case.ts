import { Inject, Injectable } from '@nestjs/common';
import { ApiTokenNotFoundError } from '../errors/api-token.errors';
import { ApiTokenRepository } from '../repository/api-token.repository';

@Injectable()
export class RevokeApiTokenUseCase {
  constructor(@Inject(ApiTokenRepository) private readonly tokens: ApiTokenRepository) {}

  async execute(userId: string, tokenId: string): Promise<void> {
    if (!(await this.tokens.deleteForUser(userId, tokenId))) throw new ApiTokenNotFoundError();
  }
}
