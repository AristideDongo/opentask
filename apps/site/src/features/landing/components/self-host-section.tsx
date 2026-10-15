import { Alert, AlertDescription } from '@opentask/ui/components/alert';
import { Button } from '@opentask/ui/components/button';
import { Server, ShieldCheck } from 'lucide-react';
import { ExternalLink } from '../../../shared/components/external-link';
import { SITE } from '../../../shared/config/site.config';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';

export function SelfHostSection({ content }: { content: LandingContent }) {
  const { selfHost } = content;
  return (
    <section
      aria-labelledby={`${SECTION_IDS.selfHost}-title`}
      id={SECTION_IDS.selfHost}
      className="bg-card/60"
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
              <Server aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <Alert className="mt-8">
          <ShieldCheck aria-hidden />
          <AlertDescription>{selfHost.responsibilities}</AlertDescription>
        </Alert>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <ExternalLink href={SITE.installGuideUrl}>{selfHost.cta}</ExternalLink>
          </Button>
          <Button variant="outline" asChild>
            <ExternalLink href={SITE.backupGuideUrl}>{selfHost.backup}</ExternalLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
