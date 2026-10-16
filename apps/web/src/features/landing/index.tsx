import { useI18n } from '../../shared/hooks/useI18n';
import { CommunitySection } from './components/community-section';
import { FaqSection } from './components/faq-section';
import { FeaturesSection } from './components/features-section';
import { HeroSection } from './components/hero-section';
import { InstallSection } from './components/install-section';
import { LandingFooter } from './components/landing-footer';
import { LandingHeader } from './components/landing-header';
import { McpSection } from './components/mcp-section';
import { SelfHostSection } from './components/self-host-section';
import { ValuesSection } from './components/values-section';
import { landingFr } from './landing.content.fr';
import { getLandingContent } from './landing.content';

export function meta() {
  return [
    { title: landingFr.meta.title },
    { name: 'description', content: landingFr.meta.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: landingFr.meta.title },
    { property: 'og:description', content: landingFr.meta.description },
  ];
}

export default function LandingPage() {
  const { locale } = useI18n();
  const content = getLandingContent(locale);
  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        {content.skipLink}
      </a>
      <LandingHeader content={content} />
      <main id="main">
        <HeroSection content={content} />
        <ValuesSection content={content} />
        <FeaturesSection content={content} />
        <SelfHostSection content={content} />
        <McpSection content={content} />
        <InstallSection content={content} />
        <CommunitySection content={content} />
        <FaqSection content={content} />
      </main>
      <LandingFooter content={content} />
    </div>
  );
}
