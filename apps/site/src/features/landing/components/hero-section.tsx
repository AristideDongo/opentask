import { Badge } from '@opentask/ui/components/badge';
import { Button } from '@opentask/ui/components/button';
import { Check } from 'lucide-react';
import { GithubIcon } from '../../../shared/components/github-icon';
import { ExternalLink } from '../../../shared/components/external-link';
import { SITE } from '../../../shared/config/site.config';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { KanbanIllustration } from './kanban-illustration';

export function HeroSection({ content }: { content: LandingContent }) {
  const { hero } = content;
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2"
    >
      <div>
        <Badge variant="secondary">{hero.eyebrow}</Badge>
        <h1
          id="hero-title"
          className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          {hero.title}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">{hero.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <a href={`#${SECTION_IDS.install}`}>{hero.primary}</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <ExternalLink href={SITE.repositoryUrl}>
              <GithubIcon />
              {hero.secondary}
            </ExternalLink>
          </Button>
        </div>
        <ul className="mt-8 grid gap-2 text-sm sm:grid-cols-2">
          {hero.facts.map((fact) => (
            <li key={fact} className="flex items-center gap-2">
              <Check aria-hidden className="size-4 text-primary" />
              {fact}
            </li>
          ))}
        </ul>
      </div>
      <KanbanIllustration label={hero.illustrationLabel} />
    </section>
  );
}
