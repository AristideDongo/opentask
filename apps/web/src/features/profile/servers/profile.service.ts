import type { Me, UpdateProfileInput } from '@opentask/contracts/me/profile';
import { apiClient } from '../../../shared/utils/api-client';

export const updateProfile = (input: UpdateProfileInput) =>
  apiClient<Me>('/me', { method: 'PATCH', body: input });
