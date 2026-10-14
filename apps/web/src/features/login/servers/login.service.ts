import type { LoginInput } from '@opentask/contracts/auth/credentials';
import { apiClient } from '../../../shared/utils/api-client';

export const signIn = (input: LoginInput) =>
  apiClient('/auth/sign-in/email', { method: 'POST', body: input });
