import type { ApiToken } from '@opentask/contracts/tokens/api-token';
import type { ApiTokenVM } from '../profile.types';

export const toApiTokenVM = (token: ApiToken, now = new Date()): ApiTokenVM => ({
  id: token.id,
  name: token.name,
  hint: token.hint,
  scopes: token.scopes,
  lastUsedAt: token.lastUsedAt,
  expiresAt: token.expiresAt,
  isExpired: new Date(token.expiresAt).getTime() <= now.getTime(),
});
