import { SEARCH_INDEX_PATH } from '../docs.const';
import type { DocSearchEntry } from '../docs.types';

export async function fetchSearchIndex(): Promise<DocSearchEntry[]> {
  const response = await fetch(SEARCH_INDEX_PATH);
  if (!response.ok) throw new Error(`Index de recherche indisponible (${response.status}).`);
  return (await response.json()) as DocSearchEntry[];
}
