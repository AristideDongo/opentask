import type { ApiToken as ApiTokenRow } from '@opentask/database/client';
import type { ApiToken } from '@opentask/contracts/tokens/api-token';
import { knownScopes } from '../helpers/api-token.helper';

export const toApiTokenDto = (row: ApiTokenRow): ApiToken => ({
  id: row.id,
  name: row.name,
  hint: row.hint,
  scopes: knownScopes(row.scopes),
  lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  expiresAt: row.expiresAt.toISOString(),
  createdAt: row.createdAt.toISOString(),
});
