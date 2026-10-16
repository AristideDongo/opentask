import { Bot, Check } from 'lucide-react';
import { LinkButton } from '../../../shared/components/link-button';
import { LANDING_LINKS, SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';
import { StatusBadge } from './status-badge';

export function McpSection({ content }: { content: LandingContent }) {
  const { mcp, status } = content;
  return (
    <section
      id={SECTION_IDS.mcp}
      aria-labelledby={`${SECTION_IDS.mcp}-title`}
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6"
    >
      <SectionHeading id={`${SECTION_IDS.mcp}-title`} title={mcp.title} intro={mcp.intro} />
      <ol className="mb-12 grid gap-4 md:grid-cols-3">
        {mcp.steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-[var(--radius-panel)] border border-line bg-surface p-5"
          >
            <span
              className="flex size-9 items-center justify-center rounded-full font-bold text-white"
              style={{ backgroundColor: `var(--brand-${7 + index})` }}
            >
              {index + 1}
            </span>
            <h3 className="mt-3 font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="grid gap-8 lg:grid-cols-2">
        <ul className="space-y-3">
          {mcp.examples.map((example) => (
            <li
              key={example}
              className="flex gap-3 rounded-[var(--radius-panel)] border border-line bg-surface p-4"
            >
              <Bot aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
              <span>{example}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-6">
          <ul className="space-y-2">
            {mcp.guarantees.map((guarantee) => (
              <li key={guarantee} className="flex gap-2 text-sm">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                {guarantee}
              </li>
            ))}
          </ul>
          <div className="grid gap-3 sm:grid-cols-2">
            {mcp.clients.map((client) => (
              <div
                key={client.name}
                className="rounded-[var(--radius-panel)] border border-line bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{client.name}</h3>
                  <StatusBadge status={client.status} label={status[client.status]} />
                </div>
                <p className="mt-2 text-sm text-muted">{client.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton to={LANDING_LINKS.mcpClaude}>{mcp.claudeCta}</LinkButton>
            <LinkButton to={LANDING_LINKS.mcp} variant="secondary">
              {mcp.cta}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
