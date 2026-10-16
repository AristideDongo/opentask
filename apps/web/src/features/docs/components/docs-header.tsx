import * as Dialog from '@radix-ui/react-dialog';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { AuthActions } from '../../../shared/components/auth-actions';
import { GithubIcon } from '../../../shared/components/github-icon';
import { Logo } from '../../../shared/components/logo';
import { PaletteStripe } from '../../../shared/components/palette-stripe';
import { REPOSITORY_URL } from '../../../shared/constants/paths';
import { DocsSearch } from './docs-search';
import { DocsSidebar } from './docs-sidebar';

const AUTH_LABELS = {
  login: 'Se connecter',
  register: 'Créer un compte',
  openApp: 'Ouvrir l’application',
};

export function DocsHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <PaletteStripe className="h-1" />
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger className="rounded p-1.5 text-muted hover:bg-sunken lg:hidden">
            <Menu aria-hidden className="size-5" />
            <span className="sr-only">Menu de la documentation</span>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-line bg-surface p-5"
            >
              <Dialog.Title className="mb-4 font-bold">Documentation</Dialog.Title>
              <DocsSidebar onNavigate={() => setMenuOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Logo className="size-6" />
          OpenTask
        </Link>
        <Link
          to="/docs"
          className="hidden text-sm font-semibold text-muted hover:text-ink sm:inline"
        >
          Documentation
        </Link>
        <div className="flex flex-1 justify-center">
          <DocsSearch />
        </div>
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded p-1.5 text-muted hover:text-ink sm:inline-flex"
        >
          <GithubIcon className="size-5" />
          <span className="sr-only">Code source sur GitHub</span>
        </a>
        <div className="hidden md:block">
          <AuthActions labels={AUTH_LABELS} />
        </div>
      </div>
    </header>
  );
}
