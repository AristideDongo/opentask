import { clsx } from 'clsx';
import { Link, useLocation } from 'react-router';
import { DOCS_NAV } from '../docs.const';
import { docPath } from '../mappers/doc-path.mapper';

const withoutTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const current = withoutTrailingSlash(useLocation().pathname);
  return (
    <nav aria-label="Documentation" className="space-y-6 text-sm">
      {DOCS_NAV.map((section) => (
        <div key={section.title}>
          <p className="mb-2 font-semibold text-ink">{section.title}</p>
          <ul className="space-y-0.5 border-l border-line">
            {section.items.map((item) => {
              const path = docPath(item.slug);
              const active = current === path;
              return (
                <li key={item.slug}>
                  <Link
                    to={path}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={clsx(
                      '-ml-px block border-l-2 py-1 pl-3',
                      active
                        ? 'border-accent font-semibold text-accent'
                        : 'border-transparent text-muted hover:border-line hover:text-ink',
                    )}
                  >
                    {item.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
