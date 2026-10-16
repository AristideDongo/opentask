import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';
import { StatusBadge } from './status-badge';

export function FeaturesSection({ content }: { content: LandingContent }) {
  const { features, status } = content;
  return (
    <section
      id={SECTION_IDS.features}
      aria-labelledby={`${SECTION_IDS.features}-title`}
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6"
    >
      <SectionHeading
        id={`${SECTION_IDS.features}-title`}
        title={features.title}
        intro={features.intro}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.items.map((feature) => (
          <li
            key={feature.title}
            className="rounded-[var(--radius-panel)] border border-line bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{feature.title}</h3>
              <StatusBadge status={feature.status} label={status[feature.status]} />
            </div>
            <p className="mt-2 text-sm text-muted">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
