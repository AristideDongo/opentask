import type {
  CreatedInvitation,
  CreateInvitationInput,
  InvitationList,
} from '@opentask/contracts/invitations/invitation';
import type { Member } from '@opentask/contracts/members/member';
import type { AssignableRole } from '@opentask/contracts/workspaces/roles';
import { apiClient, nullOn } from '../../../shared/utils/api-client';

export const fetchInvitations = (workspaceId: string) =>
  nullOn(403, apiClient<InvitationList>(`/workspaces/${workspaceId}/invitations`));

export const inviteMember = (workspaceId: string, input: CreateInvitationInput) =>
  apiClient<CreatedInvitation>(`/workspaces/${workspaceId}/invitations`, {
    method: 'POST',
    body: input,
  });

export const revokeInvitation = (workspaceId: string, invitationId: string) =>
  apiClient<void>(`/workspaces/${workspaceId}/invitations/${invitationId}`, { method: 'DELETE' });

export const changeMemberRole = (workspaceId: string, userId: string, role: AssignableRole) =>
  apiClient<Member>(`/workspaces/${workspaceId}/members/${userId}`, {
    method: 'PATCH',
    body: { role },
  });

export const removeMember = (workspaceId: string, userId: string) =>
  apiClient<void>(`/workspaces/${workspaceId}/members/${userId}`, { method: 'DELETE' });
