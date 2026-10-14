import type { InvitationStatus } from '@opentask/contracts/invitations/invitation';
import { INVITATION_TTL_DAYS } from '../invitations.const';

interface InvitationState {
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
}

export function invitationStatus(invitation: InvitationState, now: Date): InvitationStatus {
  if (invitation.acceptedAt) return 'accepted';
  if (invitation.revokedAt) return 'revoked';
  if (invitation.expiresAt.getTime() <= now.getTime()) return 'expired';
  return 'pending';
}

export const invitationExpiry = (now: Date): Date =>
  new Date(now.getTime() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const inviteUrl = (publicUrl: string, token: string) =>
  `${publicUrl.replace(/\/$/, '')}/invite/${token}`;
