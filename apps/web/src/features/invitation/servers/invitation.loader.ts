import { fetchMe } from '../../../shared/servers/session.service';
import { fetchInvitationPreview } from './invitation.service';

export async function invitationLoader({ params }: { params: { token?: string } }) {
  const [preview, me] = await Promise.all([fetchInvitationPreview(params.token ?? ''), fetchMe()]);
  return { preview, meEmail: me?.email ?? null };
}
