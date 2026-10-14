import type {
  AcceptInvitationResult,
  InvitationPreview,
} from '@opentask/contracts/invitations/invitation';
import { apiClient, nullOn } from '../../../shared/utils/api-client';

export const fetchInvitationPreview = (token: string) =>
  nullOn(410, apiClient<InvitationPreview>(`/invitations/${token}`));

export const acceptInvitation = (token: string) =>
  apiClient<AcceptInvitationResult>(`/invitations/${token}/accept`, { method: 'POST', body: {} });
