import { CreateWorkspaceInputSchema } from '@opentask/contracts/workspaces/workspace';
import { redirect } from 'react-router';
import { invalidInput, toActionResult } from '../../../shared/utils/action-result';
import { createWorkspace } from './onboarding.service';

export async function onboardingAction({ request }: { request: Request }) {
  const input = CreateWorkspaceInputSchema.safeParse(await request.json());
  if (!input.success) return invalidInput();
  const result = await toActionResult(() => createWorkspace(input.data));
  return result.ok ? redirect(`/w/${result.data.id}`) : result;
}
