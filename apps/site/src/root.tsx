import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router';
import { localeFromPath } from './shared/utils/seo';
import './app.css';

export function Layout({ children }: { children: ReactNode }) {
  const lang = localeFromPath(useLocation().pathname);
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#1f6f5c" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
  return <Outlet />;
}
