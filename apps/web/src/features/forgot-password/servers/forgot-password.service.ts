import { apiClient } from '../../../shared/utils/api-client';

export const requestPasswordReset = (email: string, redirectTo: string) =>
  apiClient('/auth/request-password-reset', { method: 'POST', body: { email, redirectTo } });
