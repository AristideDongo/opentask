import { Button } from '@opentask/ui/components/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@opentask/ui/components/sheet';
import { Languages, Menu } from 'lucide-react';
import { GithubIcon } from '../../../shared/components/github-icon';
import { ExternalLink } from '../../../shared/components/external-link';
import { Logo } from '../../../shared/components/logo';
import { SITE } from '../../../shared/config/site.config';
import { localePath } from '../landing.content';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';

export function SiteHeader({ content }: { content: LandingContent }) {
  const other = content.locale === 'fr' ? 'en' : 'fr';
  const links = [
    { href: `#${SECTION_IDS.features}`, label: content.nav.features },
    { href: `#${SECTION_IDS.selfHost}`, label: content.nav.selfHost },
    { href: `#${SECTION_IDS.mcp}`, label: content.nav.mcp },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <a href={localePath(content.locale)} className="flex items-center gap-2 font-bold">
          <Logo />
          {SITE.name}
        </a>
        <nav aria-label={content.nav.menu} className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} variant="ghost" asChild>
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
          <Button variant="ghost" asChild>
            <ExternalLink href={SITE.docsUrl}>{content.nav.docs}</ExternalLink>
          </Button>
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <a href={localePath(other)} hrefLang={other} lang={other}>
              <Languages aria-hidden />
              {content.nav.language}
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <ExternalLink href={SITE.repositoryUrl}>
              <GithubIcon />
              {content.nav.github}
            </ExternalLink>
          </Button>
          <Button size="sm" asChild>
            <a href={`#${SECTION_IDS.install}`}>{content.hero.primary}</a>
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto md:hidden">
              <Menu aria-hidden />
              <span className="sr-only">{content.nav.menu}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="px-4 pt-4">{content.nav.menu}</SheetTitle>
            <nav aria-label={content.nav.menu} className="flex flex-col gap-1 px-2">
              {links.map((link) => (
                <Button key={link.href} variant="ghost" className="justify-start" asChild>
                  <a href={link.href}>{link.label}</a>
                </Button>
              ))}
              <Button variant="ghost" className="justify-start" asChild>
                <ExternalLink href={SITE.docsUrl}>{content.nav.docs}</ExternalLink>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <ExternalLink href={SITE.repositoryUrl}>{content.nav.github}</ExternalLink>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <a href={localePath(other)} hrefLang={other} lang={other}>
                  {content.nav.language}
                </a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
