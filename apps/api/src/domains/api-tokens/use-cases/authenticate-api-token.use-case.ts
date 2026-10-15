import { Inject, Injectable } from '@nestjs/common';
import { hashToken } from '../../../shared/utils/secret-token';
import { identityFromToken, shouldRefreshLastUsed } from '../helpers/api-token.helper';
import { ApiTokenRepository } from '../repository/api-token.repository';
import type { TokenIdentity } from '../types/api-token.types';

@Injectable()
export class AuthenticateApiTokenUseCase {
  constructor(@Inject(ApiTokenRepository) private readonly tokens: ApiTokenRepository) {}

  async execute(token: string): Promise<TokenIdentity | null> {
    const row = await this.tokens.findByHash(hashToken(token));
    if (!row) return null;
    const now = new Date();
    const identity = identityFromToken(row, now);
    if (!identity) return null;
    if (shouldRefreshLastUsed(row.lastUsedAt, now)) await this.tokens.touch(row.id, now);
    return identity;
  }
}
