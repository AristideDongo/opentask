import type { AuditLogPage } from '@opentask/contracts/audit/audit-log';
import { toAuditEntryVM } from '../../../shared/mappers/workspace.mapper';
import type { AuditPageVM } from '../workspace-settings.types';

export const toAuditPageVM = (page: AuditLogPage): AuditPageVM => ({
  entries: page.items.map(toAuditEntryVM),
  nextCursor: page.nextCursor ?? null,
});
