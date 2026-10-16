import { Server, ShieldCheck } from 'lucide-react';
import { LinkButton } from '../../../shared/components/link-button';
import { LANDING_LINKS, SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';

export function SelfHostSection({ content }: { content: LandingContent }) {
  const { selfHost } = content;
  return (
    <section
      id={SECTION_IDS.selfHost}
      aria-labelledby={`${SECTION_IDS.selfHost}-title`}
      className="scroll-mt-20 bg-surface"
    >
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <SectionHeading
          id={`${SECTION_IDS.selfHost}-title`}
          title={selfHost.title}
          intro={selfHost.intro}
        />
        <ul className="space-y-3">
          {selfHost.points.map((point) => (
            <li key={point} className="flex gap-3">
              <Server aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 flex gap-3 rounded-[var(--radius-panel)] border border-line bg-accent-soft p-4 text-sm">
          <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
          <span>{selfHost.responsibilities}</span>
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton to={LANDING_LINKS.install}>{selfHost.cta}</LinkButton>
          <LinkButton to={LANDING_LINKS.backup} variant="secondary">
            {selfHost.backup}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
