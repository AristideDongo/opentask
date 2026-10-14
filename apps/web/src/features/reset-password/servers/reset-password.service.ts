import type { ResetPasswordInput } from '@opentask/contracts/auth/credentials';
import { apiClient } from '../../../shared/utils/api-client';

export const resetPassword = (input: ResetPasswordInput) =>
  apiClient('/auth/reset-password', { method: 'POST', body: input });
