import { RegisterInputSchema } from '@opentask/contracts/auth/credentials';
import { redirect } from 'react-router';
import { invalidInput, toActionResult } from '../../../shared/utils/action-result';
import { safeRedirect } from '../../../shared/utils/safe-redirect';
import { signUp } from './register.service';

export async function registerAction({ request }: { request: Request }) {
  const input = RegisterInputSchema.safeParse(await request.json());
  if (!input.success) return invalidInput();
  const redirectTo = safeRedirect(new URL(request.url).searchParams.get('redirectTo'));
  const result = await toActionResult(() => signUp(input.data, redirectTo));
  if (!result.ok) return result;
  if (!result.data.token)
    return { ok: true as const, data: { pendingVerification: input.data.email } };
  return redirect(redirectTo);
}
