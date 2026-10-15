import type { Me, UpdateProfileInput } from '@opentask/contracts/me/profile';
import type {
  ApiTokenList,
  CreateApiTokenInput,
  CreatedApiToken,
} from '@opentask/contracts/tokens/api-token';
import { apiClient } from '../../../shared/utils/api-client';

export const updateProfile = (input: UpdateProfileInput) =>
  apiClient<Me>('/me', { method: 'PATCH', body: input });

export const fetchApiTokens = () => apiClient<ApiTokenList>('/me/api-tokens');

export const createApiToken = (input: CreateApiTokenInput) =>
  apiClient<CreatedApiToken>('/me/api-tokens', { method: 'POST', body: input });

export const revokeApiToken = (tokenId: string) =>
  apiClient<void>(`/me/api-tokens/${tokenId}`, { method: 'DELETE' });
