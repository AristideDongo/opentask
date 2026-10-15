import { Button } from '@opentask/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@opentask/ui/components/card';
import { Bot, Check } from 'lucide-react';
import { ExternalLink } from '../../../shared/components/external-link';
import { StatusBadge } from '../../../shared/components/status-badge';
import { SITE } from '../../../shared/config/site.config';
import { SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';

export function McpSection({ content }: { content: LandingContent }) {
  const { mcp, status } = content;
  return (
    <section
      aria-labelledby={`${SECTION_IDS.mcp}-title`}
      id={SECTION_IDS.mcp}
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
    >
      <SectionHeading id={`${SECTION_IDS.mcp}-title`} title={mcp.title} intro={mcp.intro} />
      <div className="grid gap-8 lg:grid-cols-2">
        <ul className="space-y-3">
          {mcp.examples.map((example) => (
            <li key={example} className="flex gap-3 rounded-lg border border-border bg-card p-4">
              <Bot aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>{example}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-6">
          <ul className="space-y-2">
            {mcp.guarantees.map((guarantee) => (
              <li key={guarantee} className="flex gap-2 text-sm">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                {guarantee}
              </li>
            ))}
          </ul>
          <div className="grid gap-3 sm:grid-cols-2">
            {mcp.clients.map((client) => (
              <Card key={client.name}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      <h3>{client.name}</h3>
                    </CardTitle>
                    <StatusBadge status={client.status} label={status[client.status]} />
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{client.detail}</CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" asChild>
            <ExternalLink href={SITE.mcpGuideUrl}>{mcp.cta}</ExternalLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
