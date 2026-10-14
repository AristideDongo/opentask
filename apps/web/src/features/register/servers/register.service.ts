import type { RegisterInput } from '@opentask/contracts/auth/credentials';
import { apiClient } from '../../../shared/utils/api-client';

export const signUp = (input: RegisterInput, callbackURL: string) =>
  apiClient<{ token: string | null }>('/auth/sign-up/email', {
    method: 'POST',
    body: { ...input, callbackURL },
  });
