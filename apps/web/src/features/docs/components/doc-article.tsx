import { ExternalLink } from 'lucide-react';
import { DOCS_EDIT_URL } from '../docs.const';
import type { DocPageVM } from '../docs.types';

export function DocArticle({ page }: { page: DocPageVM }) {
  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1">
        <div className="doc-prose" dangerouslySetInnerHTML={{ __html: page.html }} />
        <p className="mt-12 border-t border-line pt-4 text-sm">
          <a
            href={`${DOCS_EDIT_URL}/${page.sourcePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted hover:text-accent"
          >
            Proposer une modification de cette page
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
        </p>
      </article>
      {page.headings.length > 1 && (
        <nav
          aria-label="Sur cette page"
          className="sticky top-24 hidden max-h-[calc(100vh-8rem)] w-56 shrink-0 self-start overflow-y-auto text-sm xl:block"
        >
          <p className="mb-2 font-semibold">Sur cette page</p>
          <ul className="space-y-1">
            {page.headings.map((heading) => (
              <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}>
                <a href={`#${heading.id}`} className="text-muted hover:text-accent">
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
