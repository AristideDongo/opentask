import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { LinkButton } from '../../../shared/components/link-button';
import { INSTALL_COMMANDS, LANDING_LINKS, SECTION_IDS } from '../landing.const';
import type { LandingContent } from '../landing.types';
import { SectionHeading } from './section-heading';

export function InstallSection({ content }: { content: LandingContent }) {
  const { install } = content;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMANDS.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id={SECTION_IDS.install}
      aria-labelledby={`${SECTION_IDS.install}-title`}
      className="scroll-mt-20 bg-surface"
    >
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <SectionHeading
          id={`${SECTION_IDS.install}-title`}
          title={install.title}
          intro={install.intro}
        />
        <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[#0b1f33] text-[#e6f1f5]">
          <div
            aria-hidden
            className="h-1"
            style={{ background: 'linear-gradient(90deg, var(--brand-1), var(--brand-10))' }}
          />
          <button
            type="button"
            onClick={() => void copy()}
            className="absolute top-4 right-3 inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-control)] bg-white/10 px-3 text-sm font-semibold hover:bg-white/20"
          >
            {copied ? (
              <Check aria-hidden className="size-4" />
            ) : (
              <Copy aria-hidden className="size-4" />
            )}
            <span aria-live="polite">{copied ? install.copied : install.copy}</span>
          </button>
          <pre
            tabIndex={0}
            aria-label={install.title}
            className="overflow-x-auto p-5 pt-14 text-sm leading-relaxed sm:pt-5 sm:pr-48"
          >
            <code>
              {INSTALL_COMMANDS.map((command) => (
                <span key={command} className="block">
                  <span aria-hidden className="text-[var(--brand-2)] select-none">
                    ${' '}
                  </span>
                  {command}
                </span>
              ))}
            </code>
          </pre>
        </div>
        <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-muted">
          {install.prerequisites.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <LinkButton to={LANDING_LINKS.install} className="mt-6">
          {install.cta}
        </LinkButton>
      </div>
    </section>
  );
}
