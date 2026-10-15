import type { ApiTokenScope } from '@opentask/contracts/tokens/api-token';

export interface ApiTokenVM {
  id: string;
  name: string;
  hint: string;
  scopes: ApiTokenScope[];
  lastUsedAt: string | null;
  expiresAt: string;
  isExpired: boolean;
}
