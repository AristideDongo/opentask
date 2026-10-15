import { Button } from '@opentask/ui/components/button';
import { useLocation } from 'react-router';
import { Logo } from '../../shared/components/logo';
import { LOCALE_PATHS, localeFromPath } from '../../shared/utils/seo';

const TEXT = {
  fr: {
    title: 'Page introuvable',
    body: 'Cette page n’existe pas ou a été déplacée.',
    back: 'Retour à l’accueil',
  },
  en: {
    title: 'Page not found',
    body: 'This page does not exist or has moved.',
    back: 'Back to home',
  },
};

export function meta() {
  return [{ title: 'Page introuvable — OpenTask' }, { name: 'robots', content: 'noindex' }];
}

export default function NotFoundPage() {
  const locale = localeFromPath(useLocation().pathname);
  const text = TEXT[locale];
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo className="size-10" />
      <h1 className="text-3xl font-bold">{text.title}</h1>
      <p className="text-muted-foreground">{text.body}</p>
      <Button asChild>
        <a href={LOCALE_PATHS[locale]}>{text.back}</a>
      </Button>
    </main>
  );
}
