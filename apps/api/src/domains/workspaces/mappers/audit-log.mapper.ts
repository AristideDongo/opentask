import { type AuditLogEntry, AuditLogEntrySchema } from '@opentask/contracts/audit/audit-log';

interface AuditRow {
  id: string;
  action: string;
  actor: { id: string; name: string } | null;
  targetType: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: Date;
}

export const toAuditLogEntryDto = (row: AuditRow): AuditLogEntry =>
  AuditLogEntrySchema.parse({
    id: row.id,
    action: row.action,
    actor: row.actor,
    targetType: row.targetType,
    targetId: row.targetId,
    metadata: row.metadata ?? {},
    createdAt: row.createdAt.toISOString(),
  });
