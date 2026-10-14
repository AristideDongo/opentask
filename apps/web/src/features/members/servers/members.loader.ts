import { toInvitationVM } from '../../../shared/mappers/workspace.mapper';
import { fetchInvitations } from './members.service';

export async function membersLoader({ params }: { params: { workspaceId?: string } }) {
  const invitations = await fetchInvitations(params.workspaceId ?? '');
  return { invitations: invitations ? invitations.items.map(toInvitationVM) : null };
}
