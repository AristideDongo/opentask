import * as Dialog from '@radix-ui/react-dialog';
import { Languages, Menu } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { AuthActions } from '../../../shared/components/auth-actions';
import { GithubIcon } from '../../../shared/components/github-icon';
import { Logo } from '../../../shared/components/logo';
import { PaletteStripe } from '../../../shared/components/palette-stripe';
import { useI18n } from '../../../shared/hooks/useI18n';
import { LANDING_LINKS, SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';

const navClass =
  'rounded-[var(--radius-control)] px-3 py-2 text-[0.9375rem] font-medium text-muted hover:bg-sunken hover:text-ink';

export function LandingHeader({ content }: { content: LandingContent }) {
  const { setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const other = content.locale === 'fr' ? 'en' : 'fr';
  const authLabels = {
    login: content.nav.login,
    register: content.nav.register,
    openApp: content.nav.openApp,
  };
  const anchors = [
    { href: `#${SECTION_IDS.features}`, label: content.nav.features },
    { href: `#${SECTION_IDS.selfHost}`, label: content.nav.selfHost },
    { href: `#${SECTION_IDS.mcp}`, label: content.nav.mcp },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
      <PaletteStripe className="h-1" />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <Logo />
          OpenTask
        </Link>
        <nav aria-label={content.nav.menu} className="hidden flex-1 items-center gap-1 md:flex">
          {anchors.map((link) => (
            <a key={link.href} href={link.href} className={navClass}>
              {link.label}
            </a>
          ))}
          <Link to={LANDING_LINKS.docs} className={navClass}>
            {content.nav.docs}
          </Link>
        </nav>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          <button type="button" onClick={() => setLocale(other)} lang={other} className={navClass}>
            <span className="inline-flex items-center gap-1.5">
              <Languages aria-hidden className="size-4" />
              {content.nav.language}
            </span>
          </button>
          <a
            href={LANDING_LINKS.repository}
            target="_blank"
            rel="noopener noreferrer"
            className={navClass}
          >
            <GithubIcon className="size-5" />
            <span className="sr-only">{content.nav.github}</span>
          </a>
          <AuthActions labels={authLabels} />
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="ml-auto rounded p-2 text-muted hover:bg-sunken md:hidden">
            <Menu aria-hidden className="size-5" />
            <span className="sr-only">{content.nav.menu}</span>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col gap-1 border-l border-line bg-surface p-5"
            >
              <Dialog.Title className="mb-3 font-bold">{content.nav.menu}</Dialog.Title>
              {anchors.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={navClass}
                >
                  {link.label}
                </a>
              ))}
              <Link to={LANDING_LINKS.docs} className={navClass}>
                {content.nav.docs}
              </Link>
              <a
                href={LANDING_LINKS.repository}
                target="_blank"
                rel="noopener noreferrer"
                className={navClass}
              >
                {content.nav.github}
              </a>
              <button
                type="button"
                onClick={() => setLocale(other)}
                lang={other}
                className={`${navClass} text-left`}
              >
                {content.nav.language}
              </button>
              <div className="mt-4 border-t border-line pt-4">
                <AuthActions labels={authLabels} />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
