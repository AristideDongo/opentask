import type { ReactNode } from 'react';
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from 'react-router';
import { DocArticle } from './components/doc-article';
import { DocsHeader } from './components/docs-header';
import { DocsHome } from './components/docs-home';
import { DocsSidebar } from './components/docs-sidebar';
import { docsLoader } from './servers/docs.loader';

export const loader = docsLoader;

export function meta({ data }: { data: Awaited<ReturnType<typeof docsLoader>> | undefined }) {
  const page = data?.page;
  return [
    { title: page ? `${page.title} — Documentation OpenTask` : 'Documentation — OpenTask' },
    {
      name: 'description',
      content:
        page?.description ||
        'Documentation d’OpenTask : utilisation, installation, administration, API et serveur MCP.',
    },
  ];
}

function DocsShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <DocsHeader />
      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-10 sm:px-6">
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-60 shrink-0 self-start overflow-y-auto lg:block">
          <DocsSidebar />
        </aside>
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const { page } = useLoaderData<typeof docsLoader>();
  return <DocsShell>{page ? <DocArticle key={page.slug} page={page} /> : <DocsHome />}</DocsShell>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return (
    <DocsShell>
      <h1 className="text-3xl font-bold">Page introuvable</h1>
      <p className="mt-3 text-muted">
        {missing
          ? 'Cette page de documentation n’existe pas ou a été déplacée.'
          : 'Cette page de documentation n’existe pas ou n’a pas pu être chargée.'}
      </p>
      <Link to="/docs" className="mt-6 inline-block font-semibold text-accent underline">
        Retour à la documentation
      </Link>
    </DocsShell>
  );
}
