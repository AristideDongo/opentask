import type { ApiTokenScope } from '@opentask/contracts/tokens/api-token';

export interface TokenFacts {
  userId: string;
  scopes: string[];
  expiresAt: Date;
}

export interface TokenIdentity {
  userId: string;
  scopes: ApiTokenScope[];
}
