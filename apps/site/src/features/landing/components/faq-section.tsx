import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@opentask/ui/components/accordion';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';

export function FaqSection({ content }: { content: LandingContent }) {
  const { faq } = content;
  return (
    <section
      aria-labelledby={`${SECTION_IDS.faq}-title`}
      id={SECTION_IDS.faq}
      className="bg-card/60"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <SectionHeading id={`${SECTION_IDS.faq}-title`} title={faq.title} />
        <Accordion type="multiple">
          {faq.items.map((item, index) => (
            <AccordionItem key={item.question} value={`q${index}`}>
              <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
