import { useEffect, useMemo, useState } from 'react';
import type { DocSearchEntry } from '../docs.types';
import { searchDocs } from '../mappers/search.mapper';
import { fetchSearchIndex } from '../servers/docs.service';

export function useDocsSearch(enabled: boolean) {
  const [entries, setEntries] = useState<DocSearchEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!enabled || entries) return;
    fetchSearchIndex()
      .then(setEntries)
      .catch(() => setError(true));
  }, [enabled, entries]);

  const results = useMemo(() => (entries ? searchDocs(entries, query) : []), [entries, query]);
  return { query, setQuery, results, loading: enabled && !entries && !error, error };
}
