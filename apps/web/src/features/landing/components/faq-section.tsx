import { ChevronDown } from 'lucide-react';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';

export function FaqSection({ content }: { content: LandingContent }) {
  const { faq } = content;
  return (
    <section
      id={SECTION_IDS.faq}
      aria-labelledby={`${SECTION_IDS.faq}-title`}
      className="scroll-mt-20 bg-surface"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <SectionHeading id={`${SECTION_IDS.faq}-title`} title={faq.title} />
        <div className="divide-y divide-line border-y border-line">
          {faq.items.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="pb-4 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
