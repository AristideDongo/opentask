import { UpdateProfileInputSchema } from '@opentask/contracts/me/profile';
import { invalidInput, toActionResult } from '../../../shared/utils/action-result';
import { updateProfile } from './profile.service';

export async function profileAction({ request }: { request: Request }) {
  const input = UpdateProfileInputSchema.safeParse(await request.json());
  if (!input.success) return invalidInput();
  return toActionResult(() => updateProfile(input.data));
}
