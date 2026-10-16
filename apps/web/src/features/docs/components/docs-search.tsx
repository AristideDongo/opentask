import * as Dialog from '@radix-ui/react-dialog';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useDocsSearch } from '../hooks/useDocsSearch';
import { docPath } from '../mappers/doc-path.mapper';

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results, loading, error } = useDocsSearch(open);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="flex h-9 w-full max-w-64 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-3 text-sm text-muted hover:border-accent">
        <Search aria-hidden className="size-4" />
        <span className="flex-1 text-left">Rechercher</span>
        <kbd className="hidden rounded border border-line px-1.5 text-xs sm:inline">Ctrl K</kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-[10vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 rounded-[var(--radius-panel)] border border-line bg-surface shadow-2xl"
        >
          <Dialog.Title className="sr-only">Rechercher dans la documentation</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-line px-4">
            <Search aria-hidden className="size-4 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher : jeton, MCP, installation…"
              aria-label="Rechercher dans la documentation"
              className="h-12 flex-1 bg-transparent text-[0.9375rem] outline-none"
            />
            <Dialog.Close className="rounded p-1 text-muted hover:text-ink">
              <X aria-hidden className="size-4" />
              <span className="sr-only">Fermer</span>
            </Dialog.Close>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2" aria-live="polite">
            {loading && <p className="p-3 text-sm text-muted">Chargement de l’index…</p>}
            {error && <p className="p-3 text-sm text-danger">La recherche est indisponible.</p>}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <p className="p-3 text-sm text-muted">Aucun résultat pour « {query} ».</p>
            )}
            <ul>
              {results.map((result) => (
                <li key={result.slug}>
                  <Link
                    to={docPath(result.slug)}
                    onClick={() => setOpen(false)}
                    className="block rounded-[var(--radius-control)] p-3 hover:bg-sunken focus-visible:bg-sunken"
                  >
                    <span className="block font-semibold">{result.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{result.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
