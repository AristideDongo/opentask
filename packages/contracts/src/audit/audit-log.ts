import { z } from 'zod';
import { paginated } from '../common/pagination';
import { IdSchema, IsoDateTimeSchema, RefSchema } from '../common/primitives';

export const AUDIT_ACTIONS = [
  'workspace.created',
  'workspace.updated',
  'workspace.deleted',
  'workspace.ownership_transferred',
  'member.role_changed',
  'member.removed',
  'member.left',
  'member.joined',
  'invitation.created',
  'invitation.revoked',
  'team.created',
  'team.deleted',
  'project.deleted',
  'channel.created',
  'channel.deleted',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AuditLogEntrySchema = z.object({
  id: IdSchema,
  action: z.enum(AUDIT_ACTIONS),
  actor: RefSchema.nullable(),
  targetType: z.string(),
  targetId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: IsoDateTimeSchema,
});
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

export const AuditLogPageSchema = paginated(AuditLogEntrySchema);
export type AuditLogPage = z.infer<typeof AuditLogPageSchema>;
