import { ForgotPasswordInputSchema } from '@opentask/contracts/auth/credentials';
import { invalidInput, toActionResult } from '../../../shared/utils/action-result';
import { requestPasswordReset } from './forgot-password.service';

export async function forgotPasswordAction({ request }: { request: Request }) {
  const input = ForgotPasswordInputSchema.safeParse(await request.json());
  if (!input.success) return invalidInput();
  const redirectTo = `${new URL(request.url).origin}/reset-password`;
  const result = await toActionResult(() => requestPasswordReset(input.data.email, redirectTo));
  return result.ok ? { ok: true as const, data: { sentTo: input.data.email } } : result;
}
