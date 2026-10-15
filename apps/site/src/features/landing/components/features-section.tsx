import { Card, CardContent, CardHeader, CardTitle } from '@opentask/ui/components/card';
import { StatusBadge } from '../../../shared/components/status-badge';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';

export function FeaturesSection({ content }: { content: LandingContent }) {
  const { features, status } = content;
  return (
    <section
      aria-labelledby={`${SECTION_IDS.features}-title`}
      id={SECTION_IDS.features}
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
    >
      <SectionHeading
        id={`${SECTION_IDS.features}-title`}
        title={features.title}
        intro={features.intro}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.items.map((feature) => (
          <li key={feature.title}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">
                    <h3>{feature.title}</h3>
                  </CardTitle>
                  <StatusBadge status={feature.status} label={status[feature.status]} />
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.body}</CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
