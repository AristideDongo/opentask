import { LoginInputSchema } from '@opentask/contracts/auth/credentials';
import { redirect } from 'react-router';
import { invalidInput, toActionResult } from '../../../shared/utils/action-result';
import { safeRedirect } from '../../../shared/utils/safe-redirect';
import { signIn } from './login.service';

export async function loginAction({ request }: { request: Request }) {
  const input = LoginInputSchema.safeParse(await request.json());
  if (!input.success) return invalidInput();
  const result = await toActionResult(() => signIn(input.data));
  if (!result.ok) return result;
  return redirect(safeRedirect(new URL(request.url).searchParams.get('redirectTo')));
}
