import { redirect } from 'react-router';
import { toActionResult } from '../../../shared/utils/action-result';
import { acceptInvitation } from './invitation.service';

export async function invitationAction({ params }: { params: { token?: string } }) {
  const result = await toActionResult(() => acceptInvitation(params.token ?? ''));
  return result.ok ? redirect(`/w/${result.data.workspaceId}`) : result;
}
