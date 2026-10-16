import { ArrowRight } from 'lucide-react';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';
import { SmartLink } from './smart-link';

export function CommunitySection({ content }: { content: LandingContent }) {
  const { community } = content;
  return (
    <section
      id={SECTION_IDS.community}
      aria-labelledby={`${SECTION_IDS.community}-title`}
      className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20 sm:px-6"
    >
      <SectionHeading
        id={`${SECTION_IDS.community}-title`}
        title={community.title}
        intro={community.intro}
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {community.links.map((link) => (
          <li key={link.label}>
            <SmartLink
              href={link.href}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-line bg-surface p-4 font-medium hover:border-accent hover:text-accent"
            >
              {link.label}
              <ArrowRight aria-hidden className="size-4" />
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
