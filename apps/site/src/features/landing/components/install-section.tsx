import { Button } from '@opentask/ui/components/button';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { ExternalLink } from '../../../shared/components/external-link';
import { SITE } from '../../../shared/config/site.config';
import { INSTALL_COMMANDS, SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';

export function InstallSection({ content }: { content: LandingContent }) {
  const { install } = content;
  const [copied, setCopied] = useState(false);
  const script = INSTALL_COMMANDS.join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-labelledby={`${SECTION_IDS.install}-title`}
      id={SECTION_IDS.install}
      className="bg-card/60"
    >
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <SectionHeading
          id={`${SECTION_IDS.install}-title`}
          title={install.title}
          intro={install.intro}
        />
        <div className="relative rounded-xl border border-border bg-foreground p-5 text-background">
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3"
            onClick={() => void copy()}
            aria-live="polite"
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? install.copied : install.copy}
          </Button>
          <pre
            tabIndex={0}
            aria-label={install.title}
            className="overflow-x-auto pt-10 text-sm leading-relaxed sm:pt-0 sm:pr-40"
          >
            <code>
              {INSTALL_COMMANDS.map((command) => (
                <span key={command} className="block">
                  <span aria-hidden className="text-background/50 select-none">
                    ${' '}
                  </span>
                  {command}
                </span>
              ))}
            </code>
          </pre>
        </div>
        <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {install.prerequisites.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Button className="mt-6" asChild>
          <ExternalLink href={SITE.installGuideUrl}>{install.cta}</ExternalLink>
        </Button>
      </div>
    </section>
  );
}
