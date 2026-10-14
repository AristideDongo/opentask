import type { AuditEntryVM } from '../../shared/types/workspace.types';

export interface AuditPageVM {
  entries: AuditEntryVM[];
  nextCursor: string | null;
}
