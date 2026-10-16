import { ArrowRight, Check } from 'lucide-react';
import { LinkButton } from '../../../shared/components/link-button';
import { LANDING_LINKS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { KanbanIllustration } from './kanban-illustration';

export function HeroSection({ content }: { content: LandingContent }) {
  const { hero } = content;
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            'radial-gradient(60% 50% at 85% 20%, var(--brand-2), transparent 70%), radial-gradient(50% 60% at 10% 90%, var(--brand-8), transparent 70%)',
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-accent">
            {hero.eyebrow}
          </span>
          <h1
            id="hero-title"
            className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-muted">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/register" size="lg">
              {hero.primary}
              <ArrowRight aria-hidden className="size-4" />
            </LinkButton>
            <LinkButton to={LANDING_LINKS.docs} variant="secondary" size="lg">
              {hero.secondary}
            </LinkButton>
          </div>
          <ul className="mt-8 grid gap-2 text-sm sm:grid-cols-2">
            {hero.facts.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <Check aria-hidden className="size-4 text-accent" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
        <KanbanIllustration label={hero.illustrationLabel} />
      </div>
    </section>
  );
}
