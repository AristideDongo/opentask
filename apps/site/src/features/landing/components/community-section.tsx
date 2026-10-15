import { ArrowRight } from 'lucide-react';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';
import { SmartLink } from './smart-link';

export function CommunitySection({ content }: { content: LandingContent }) {
  const { community } = content;
  return (
    <section
      aria-labelledby={`${SECTION_IDS.community}-title`}
      id={SECTION_IDS.community}
      className="mx-auto max-w-4xl px-4 py-20 sm:px-6"
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
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 font-medium hover:border-primary hover:text-primary"
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
