import { z } from 'zod';
import { EmailSchema, IdSchema, IsoDateTimeSchema, RefSchema } from '../common/primitives';
import { AssignableRoleSchema } from '../workspaces/roles';

export const INVITATION_STATUSES = ['pending', 'accepted', 'revoked', 'expired'] as const;
export const InvitationStatusSchema = z.enum(INVITATION_STATUSES);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

export const CreateInvitationInputSchema = z.object({
  email: EmailSchema,
  role: AssignableRoleSchema.default('member'),
});
export type CreateInvitationInput = z.input<typeof CreateInvitationInputSchema>;

export const InvitationSchema = z.object({
  id: IdSchema,
  email: z.string(),
  role: AssignableRoleSchema,
  status: InvitationStatusSchema,
  invitedBy: RefSchema.nullable(),
  expiresAt: IsoDateTimeSchema,
  createdAt: IsoDateTimeSchema,
});
export type Invitation = z.infer<typeof InvitationSchema>;

export const InvitationListSchema = z.object({ items: z.array(InvitationSchema) });
export type InvitationList = z.infer<typeof InvitationListSchema>;

export const CreatedInvitationSchema = InvitationSchema.extend({
  inviteUrl: z.url().describe('Contient le jeton secret : renvoyé uniquement à la création'),
});
export type CreatedInvitation = z.infer<typeof CreatedInvitationSchema>;

export const InvitationPreviewSchema = z.object({
  workspaceName: z.string(),
  inviterName: z.string().nullable(),
  email: z.string(),
  role: AssignableRoleSchema,
  status: InvitationStatusSchema,
});
export type InvitationPreview = z.infer<typeof InvitationPreviewSchema>;

export const AcceptInvitationResultSchema = z.object({ workspaceId: IdSchema });
export type AcceptInvitationResult = z.infer<typeof AcceptInvitationResultSchema>;
