import { useState } from 'react';
import { useI18n } from '../../../shared/hooks/useI18n';
import { toAuditPageVM } from '../mappers/audit-page.mapper';
import { fetchAuditPage } from '../servers/workspace-settings.service';
import type { AuditPageVM } from '../workspace-settings.types';

export function useAuditPages(workspaceId: string, initial: AuditPageVM) {
  const { errorMessage } = useI18n();
  const [pages, setPages] = useState([initial]);
  const [source, setSource] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (source !== initial) {
    setSource(initial);
    setPages([initial]);
  }
  const nextCursor = pages.at(-1)?.nextCursor ?? null;

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoading(true);
    setError(null);
    try {
      const next = toAuditPageVM(await fetchAuditPage(workspaceId, nextCursor));
      setPages((prev) => [...prev, next]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return {
    entries: pages.flatMap((p) => p.entries),
    hasMore: nextCursor !== null,
    loadMore,
    loading,
    error,
  };
}
