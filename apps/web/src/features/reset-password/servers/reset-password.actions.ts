import { ResetPasswordInputSchema } from '@opentask/contracts/auth/credentials';
import { redirect } from 'react-router';
import { invalidInput, toActionResult } from '../../../shared/utils/action-result';
import { resetPassword } from './reset-password.service';

export async function resetPasswordAction({ request }: { request: Request }) {
  const input = ResetPasswordInputSchema.safeParse(await request.json());
  if (!input.success) return invalidInput();
  const result = await toActionResult(() => resetPassword(input.data));
  return result.ok ? redirect('/login?reset=1') : result;
}
