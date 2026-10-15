import { useLocation } from 'react-router';
import { localeFromPath, pageMeta } from '../../shared/utils/seo';
import { CommunitySection } from './components/community-section';
import { FaqSection } from './components/faq-section';
import { FeaturesSection } from './components/features-section';
import { HeroSection } from './components/hero-section';
import { InstallSection } from './components/install-section';
import { McpSection } from './components/mcp-section';
import { SelfHostSection } from './components/self-host-section';
import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';
import { ValuesSection } from './components/values-section';
import { getLandingContent } from './landing.content';

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeFromPath(location.pathname);
  const content = getLandingContent(locale);
  return pageMeta({ ...content.meta, locale, path: location.pathname });
}

export default function LandingPage() {
  const content = getLandingContent(localeFromPath(useLocation().pathname));
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {content.skipLink}
      </a>
      <SiteHeader content={content} />
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
      <SiteFooter content={content} />
    </>
  );
}
