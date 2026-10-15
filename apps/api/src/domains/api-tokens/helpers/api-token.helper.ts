import {
  API_TOKEN_PREFIX,
  API_TOKEN_SCOPES,
  type ApiTokenScope,
} from '@opentask/contracts/tokens/api-token';
import { DAY_MS, LAST_USED_REFRESH_MS, TOKEN_HINT_LENGTH } from '../api-tokens.const';
import { ApiTokenScopeError } from '../errors/api-token.errors';
import type { TokenFacts, TokenIdentity } from '../types/api-token.types';

export const isApiToken = (value: string) => value.startsWith(API_TOKEN_PREFIX);

export const tokenHint = (token: string) =>
  `${token.slice(0, API_TOKEN_PREFIX.length + TOKEN_HINT_LENGTH)}…`;

export const tokenExpiry = (now: Date, days: number) => new Date(now.getTime() + days * DAY_MS);

export const knownScopes = (scopes: string[]): ApiTokenScope[] =>
  API_TOKEN_SCOPES.filter((scope) => scopes.includes(scope));

export function identityFromToken(facts: TokenFacts, now: Date): TokenIdentity | null {
  if (facts.expiresAt.getTime() <= now.getTime()) return null;
  return { userId: facts.userId, scopes: knownScopes(facts.scopes) };
}

export function assertTokenScope(identity: TokenIdentity, required: ApiTokenScope) {
  if (!identity.scopes.includes(required)) throw new ApiTokenScopeError(required);
}

export const shouldRefreshLastUsed = (lastUsedAt: Date | null, now: Date) =>
  !lastUsedAt || now.getTime() - lastUsedAt.getTime() > LAST_USED_REFRESH_MS;
