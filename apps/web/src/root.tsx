import type { ReactNode } from 'react';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';
import { ErrorState } from './shared/components/error-state';
import { I18nProvider } from './shared/components/i18n-provider';
import { ToastProvider } from './shared/components/toast-provider';
import { useI18n } from './shared/hooks/useI18n';
import { themeBootScript } from './shared/utils/theme';
import './app.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <title>OpenTask</title>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </I18nProvider>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <I18nProvider>
      <RootError />
    </I18nProvider>
  );
}

function RootError() {
  const error = useRouteError();
  const { t } = useI18n();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
      <ErrorState error={error} title={notFound ? t('error.notFound.title') : undefined} />
    </main>
  );
}
