import {
  type Invitation,
  type InvitationPreview,
  InvitationPreviewSchema,
  InvitationSchema,
  type InvitationStatus,
} from '@opentask/contracts/invitations/invitation';

interface InvitationRow {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: { id: string; name: string } | null;
}

export const toInvitationDto = (row: InvitationRow, status: InvitationStatus): Invitation =>
  InvitationSchema.parse({
    id: row.id,
    email: row.email,
    role: row.role,
    status,
    invitedBy: row.invitedBy,
    expiresAt: row.expiresAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  });

export const toInvitationPreviewDto = (
  row: InvitationRow & { workspace: { name: string } },
  status: InvitationStatus,
): InvitationPreview =>
  InvitationPreviewSchema.parse({
    workspaceName: row.workspace.name,
    inviterName: row.invitedBy?.name ?? null,
    email: row.email,
    role: row.role,
    status,
  });
